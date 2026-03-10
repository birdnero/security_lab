import type { InputHTMLAttributes } from "react";
import type React from "react";
import styles from "./input.shared.module.scss"
import { useWindow } from "./window.shared"

const Input: React.FC<InputHTMLAttributes<HTMLInputElement> & { boxed?: boolean }> = ({ boxed, ...props }) => {
    const { className, ...rest } = props
    const { width } = useWindow()
    const valueText = rest.value ?? ""
    const valueLength = String(valueText).length
    const hideFakePlaceholder = width < 470 ? valueLength > 24 : (width < 550 ? valueLength > 32 : valueLength > 40)
    return <div className={styles.ctn}>
        <input {...rest} className={[styles.input, className, (boxed ? styles.input_boxed : "")].filter(Boolean).join(" ")} />
        <div className={[styles.placeholderCtn, hideFakePlaceholder ? styles.placeholderCtnHidden : ""].filter(Boolean).join(" ")} >
            <div className={styles.placeholder} children={props.placeholder} />
        </div>
    </div>

}

export default Input
