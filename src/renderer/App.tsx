import { ReactElement, useCallback, useEffect } from "react";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
// import useMainPort from "./hooks/useMainPort";
import useRequest from "./hooks/useRequest";

const App = (): ReactElement => {
  // const mainPort = useMainPort();

  // useEffect(() => {
  //   (async () => {
  //     const request = useRequest();
  //     // const response = await request({ message: "getAllPasswords" });
  //     // console.log(response);
  //   })();
  // }, []);

  useEffect(() => {
    console.log("useEffect firing");
    const request = useRequest();
    const response = request({message: "getAllPasswords"});
    console.log(`[Renderer][response]: ${response}`)
  }, []);

  return (
    <div>
      <NavBar />
      <EncryptPassword />
    </div>
  );
};

export default App;
