import type { InputHTMLAttributes } from "react";
import type React from "react";
import styles from "./input.shared.module.scss"

const Input: React.FC<InputHTMLAttributes<HTMLInputElement> & { boxed?: boolean }> = ({ boxed, ...props }) => {
    const { className, ...rest } = props
    return <div className={styles.ctn}>
        <input {...rest} className={[styles.input, className, (boxed? styles.input_boxed : "")].filter(Boolean).join(" ")} />
        <div className={styles.placeholderCtn} >
            <div className={styles.placeholder} children={props.placeholder} />
        </div>
    </div>

}

export default Input
