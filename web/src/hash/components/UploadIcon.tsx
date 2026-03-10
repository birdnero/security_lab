type UploadIconProps = {
    className?: string
}

const UploadIcon = ({ className }: UploadIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
            fill="currentColor"
            d="M12 3 6.5 8.5l1.4 1.4L11 6.8V16h2V6.8l3.1 3.1 1.4-1.4L12 3Zm-7 16v2h14v-2H5Z"
        />
    </svg>
)

export default UploadIcon
