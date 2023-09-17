export function handleLogin(
    event: Electron.IpcMainInvokeEvent,
    {
        username,
        password,
    }: {
        username: string;
        password: string;
    }
) {
    // call the db with the user name and password
    // if password is validated, then return the JWT token to the renderer process
    // otherwise we will have to handle sending back an error response code of unauthorizedk
    console.log(username, password);
}
