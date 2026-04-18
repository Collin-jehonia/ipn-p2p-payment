# Simple AES-256 file encryption with key rotation
# Uses AES-GCM so we get authentication baked in

import os
import json
import base64
import hashlib
from datetime import datetime
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

KEYSTORE_PATH = "keystore.json"


def make_new_key(name):
    key_bytes = AESGCM.generate_key(bit_length=256)

    # store a short fingerprint so we can match keys to encrypted files later
    fp = hashlib.sha256(key_bytes).hexdigest()[:12]

    return {
        "name": name,
        "created": datetime.utcnow().isoformat(),
        "retired": False,
        "key_b64": base64.b64encode(key_bytes).decode(),
        "fingerprint": fp,
    }


def load_keys():
    if not os.path.exists(KEYSTORE_PATH):
        return []
    with open(KEYSTORE_PATH) as f:
        return json.load(f)


def save_keys(keys):
    with open(KEYSTORE_PATH, "w") as f:
        json.dump(keys, f, indent=2)


def get_active_key(keys):
    live = [k for k in keys if not k["retired"]]
    if not live:
        raise RuntimeError("No active keys found — did you forget to rotate?")
    return live[-1]


def encrypt_file(filepath, keys):
    current_key = get_active_key(keys)
    key_bytes = base64.b64decode(current_key["key_b64"])
    gcm = AESGCM(key_bytes)

    nonce = os.urandom(12)
    with open(filepath, "rb") as f:
        contents = f.read()

    encrypted = gcm.encrypt(nonce, contents, None)
    output_path = filepath + ".vault"

    # bundle everything the decryptor will need
    bundle = {
        "fingerprint": current_key["fingerprint"],
        "nonce": base64.b64encode(nonce).decode(),
        "data": base64.b64encode(encrypted).decode(),
    }

    with open(output_path, "w") as f:
        json.dump(bundle, f)

    print(f"Encrypted: {filepath} -> {output_path}  (key: {current_key['fingerprint']})")
    return output_path


def decrypt_file(vault_path, keys):
    with open(vault_path) as f:
        bundle = json.load(f)

    # find the key that was used to encrypt this file
    fp = bundle["fingerprint"]
    matched_key = next((k for k in keys if k["fingerprint"] == fp), None)

    if matched_key is None:
        raise ValueError(f"Couldn't find key with fingerprint '{fp}' — was the keystore modified?")

    key_bytes = base64.b64decode(matched_key["key_b64"])
    gcm = AESGCM(key_bytes)
    nonce = base64.b64decode(bundle["nonce"])
    decrypted = gcm.decrypt(nonce, base64.b64decode(bundle["data"]), None)

    out = vault_path.removesuffix(".vault")
    with open(out, "wb") as f:
        f.write(decrypted)

    print(f"Decrypted: {vault_path} -> {out}")
    return out


def rotate_keys(keys, new_key_name=None):
    # retire everything that's currently active
    for k in keys:
        if not k["retired"]:
            k["retired"] = True
            print(f"Retired key: {k['name']} ({k['fingerprint']})")

    name = new_key_name or f"key-{len(keys) + 1}"
    fresh = make_new_key(name)
    keys.append(fresh)
    print(f"New key created: {fresh['name']} ({fresh['fingerprint']})")
    return keys



def APC811S():
    keys = load_keys()

    if not keys:
        print("No keystore found, generating first key...\n")
        keys = rotate_keys(keys, "key-1")
        save_keys(keys)

    # create a test file
    test_file = "secret.txt"
    with open(test_file, "w") as f:
        f.write("This is sensitive data that needs protecting.\n")

    print()
    vault_file = encrypt_file(test_file, keys)

    # rotate and save — the old key sticks around for decrypting old files
    print()
    keys = rotate_keys(keys, "key-2")
    save_keys(keys)

    print()
    decrypt_file(vault_file, keys)

    with open(test_file) as f:
        print(f"\nRound-trip check: {f.read().strip()}")

    print("\nCurrent keystore:")
    for k in keys:
        status = "RETIRED" if k["retired"] else "ACTIVE"
        print(f"  [{status}] {k['name']} — fp={k['fingerprint']}  created={k['created']}")


if __name__ == "__main__":
    APC811S()

