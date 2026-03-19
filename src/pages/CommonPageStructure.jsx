import { Layout } from "antd";
import Sidebar from "../component/Sidebar";
import TopHeader from "../component/TopHeader";

function CommonPageStructure({ children, user }) {

    return (
        <>
            <Layout>
                <Sidebar />

                <Layout>
                    <TopHeader user={{...user}} />

                    {children}
                </Layout>
            </Layout>
        </>
    );
}

export default CommonPageStructure;