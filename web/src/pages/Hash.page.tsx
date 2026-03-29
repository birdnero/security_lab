import HashProvider from "../hash/provider.hash"
import HashContent from "../hash/components/HashContent"

const HashPage = () => {
    return (
        <HashProvider>
            <HashContent />
        </HashProvider>
    )
}

export default HashPage
