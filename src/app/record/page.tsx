import Footer from "../components/footer/Footer";
import Navbar from "../components/Navbar";
import RecordsPage from "./RecordsList";

export default function Page() {
    return (
        <div>
            <Navbar />
            <RecordsPage />
            <Footer />
        </div>
    );
}
