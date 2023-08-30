// Child process
process.parentPort.once("message", (e) => {
  console.log("this message comes from the child");
  const [port] = e.ports;
  port.postMessage({ message: "Hello from child" });
  port.start()
});
