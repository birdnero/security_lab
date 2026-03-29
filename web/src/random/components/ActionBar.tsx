import { useRandom } from "../use-random.random"
import styles from "../../shared/module.ui.module.scss"

const ActionBar = () => {
    const { onGenerate, onChizaru, onSequencePeriod, onCompare } = useRandom()

    return (
        <div className={styles.actions}>
            <button className={styles.button} onClick={onGenerate} children="Generate" />
            <button className={styles.button} onClick={onChizaru} children="Chizaru" />
            <button className={styles.button} onClick={onSequencePeriod} children="Sequence Period" />
            <button className={styles.button} onClick={onCompare} children="Compare" />
        </div>
    )
}

export default ActionBar
