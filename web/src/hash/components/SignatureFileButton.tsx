import { useId } from "react"
import type { ChangeEvent } from "react"
import { useHash } from "../use-hash.hash"
import styles from "../../random/module.random.module.scss"
import FileSignatureIcon from "./FileSignatureIcon"

type UploadFileButtonProps = {
    disabled?: boolean
}

const EXPECTED_SIGNATURE_SIZE = 32

const SignatureFileButton = ({ disabled }: UploadFileButtonProps) => {
    const { setSignatureValue } = useHash()
    const inputId = useId()

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files?.[0] ?? null
        console.log(file);
        if (!file) {
            setSignatureValue("")
            return
        }

        if (file.size !== EXPECTED_SIGNATURE_SIZE) {
            event.target.value = ""
            setSignatureValue("")
            return
        }

        const text = await file.text()
        setSignatureValue(text.trim())
    }

    return (
        <label
            className={styles.signatureFileButton}
            htmlFor={inputId}
            title="Upload file"
            aria-label="Upload file"
            aria-disabled={disabled ? "true" : "false"}
        >
            <FileSignatureIcon className={styles.saveIcon} />
            <input
                id={inputId}
                className={styles.uploadInput}
                type="file"
                disabled={disabled}
                onChange={handleChange}
            />
        </label>
    )
}

export default SignatureFileButton
