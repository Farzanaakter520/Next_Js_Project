
import Footer from "../components/footer/Footer";
import Navbar from "../components/Navbar";
import PostOpForm from "../upload/FileUploader";

export default function Page() {
    return (
        <div>
            <Navbar />
            <PostOpForm />
            <Footer />
        </div>
    );
}
