import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/layout.css";
import Layout from "./components/layout/Layout";
import AllRoutes from "./routes/allroutes";

function App() {
  return (
    <Layout>
      <AllRoutes />
    </Layout>
  );
}

export default App;
