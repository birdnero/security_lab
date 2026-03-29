import styles from "../shared/module.ui.module.scss"
import EncryptionProvider from "../encryption/provider.encryption"
import Rc5ConfigSection from "../encryption/components/Rc5ConfigSection"
import EncryptionTextSection from "../encryption/components/EncryptionTextSection"
import EncryptionResultSection from "../encryption/components/EncryptionResultSection"
import EncryptionFileSection from "../encryption/components/EncryptionFileSection"

const EncryptionPage = () => {
    return (
        <EncryptionProvider>
            <div className={styles.intro}>Configure settings, enter text, or upload a file for encryption.</div>

            <div className={styles.resultsGrid}>
                {/* <div className={styles.topGrid}> */}
                <Rc5ConfigSection />
                <EncryptionResultSection
                    title="Output"
                    saveLabel="Save output"
                    saveFilename="output"
                />
                <EncryptionTextSection
                    title="Plain text"
                    description="Enter the text you want to encrypt or decrypt."
                    placeholder="plaintext"
                />
                {/* </div> */}

                <EncryptionFileSection
                    title="File"
                    description="Upload a file to encrypt or decrypt."
                />
            </div>
        </EncryptionProvider>
    )
}

export default EncryptionPage
