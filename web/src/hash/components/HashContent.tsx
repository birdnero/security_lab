import type { ReactNode } from "react"
import uiStyles from "../../shared/module.ui.module.scss"
import ConfigSection from "./ConfigSection"
import TextSection from "./TextSection"
import FileSection from "./FileSection"
import HashResultSection from "./HashResultSection"
import HashStatsSection from "./HashStatsSection"

type HashContentProps = {
    intro?: string
    configSlot?: ReactNode
    configTitle?: string
    configText?: string
    configSelectAriaLabel?: string
    textTitle?: string
    textText?: string
    textPlaceholder?: string
    resultTitle?: string
    resultEmptyValue?: string
    resultSaveLabel?: string
    resultSaveFilename?: string
    statsTitle?: string
    statsText?: string
    statsHashSpeedLabel?: string
    statsUploadSpeedLabel?: string
    statsTotalTimeLabel?: string
    showStats?: boolean
    fileTitle?: string
    fileText?: string
    fileSignatureButtonLabel?: string
    fileSignatureUploadedLabel?: string
}

const HashContent = ({
    intro = "Configure settings, enter a string, or upload a file for hashing.",
    configSlot,
    configTitle,
    configText,
    configSelectAriaLabel,
    textTitle,
    textText,
    textPlaceholder,
    resultTitle,
    resultEmptyValue,
    resultSaveLabel,
    resultSaveFilename,
    statsTitle,
    statsText,
    statsHashSpeedLabel,
    statsUploadSpeedLabel,
    statsTotalTimeLabel,
    showStats = true,
    fileTitle,
    fileText,
    fileSignatureButtonLabel,
    fileSignatureUploadedLabel
}: HashContentProps) => {
    return <>
        <div className={uiStyles.intro}>{intro}</div>

        <div className={uiStyles.topGrid}>
            {configSlot ?? (
                <ConfigSection
                    title={configTitle}
                    description={configText}
                    selectAriaLabel={configSelectAriaLabel}
                />
            )}
            <TextSection
                title={textTitle}
                description={textText}
                placeholder={textPlaceholder}
            />
        </div>

        <div className={uiStyles.resultsGrid}>
            <HashResultSection
                title={resultTitle}
                emptyValue={resultEmptyValue}
                saveLabel={resultSaveLabel}
                saveFilename={resultSaveFilename}
            />
            {showStats ? (
                <HashStatsSection
                    title={statsTitle}
                    description={statsText}
                    hashSpeedLabel={statsHashSpeedLabel}
                    uploadSpeedLabel={statsUploadSpeedLabel}
                    totalTimeLabel={statsTotalTimeLabel}
                />
            ) : null}
            <FileSection
                title={fileTitle}
                description={fileText}
                signatureButtonLabel={fileSignatureButtonLabel}
                signatureUploadedLabel={fileSignatureUploadedLabel}
            />
        </div>
    </>
}

export default HashContent
