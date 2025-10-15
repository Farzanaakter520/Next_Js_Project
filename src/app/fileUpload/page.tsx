
import Footer from "../components/footer/Footer";
import Navbar from "../components/Navbar";
import ImageUploader from "./FileUpload";

export default function Page() {
    return (
        <div>
            <Navbar/>
            <ImageUploader />
            <Footer />
        </div>
    );
}
