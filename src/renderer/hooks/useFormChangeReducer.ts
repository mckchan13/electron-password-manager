export type FormData = ReturnType<typeof createInitialState>;

export type ActionType = Uppercase<keyof FormData> | "RESET";

export type Action<T extends string = string, P = string> = {
  type: T;
  payload: P;
};

function useFormChangeReducer() {
  return {
    createInitialState,
    formChangeReducer,
    actionCreator,
  };
}

export default useFormChangeReducer;

function createInitialState() {
  return { username: "", password: "", secret: "" };
}

function formChangeReducer(
  state: FormData,
  action: Action<ActionType>
): FormData {
  switch (action.type) {
    case "USERNAME":
      return {
        ...state,
        username: action.payload,
      };
    case "PASSWORD":
      return {
        ...state,
        password: action.payload,
      };
    case "SECRET":
      return {
        ...state,
        secret: action.payload,
      };
    case "RESET":
      return {
        username: "",
        password: "",
        secret: "",
      };
    default:
      return state;
  }
}

function actionCreator(type: ActionType, payload: string): Action<ActionType> {
  return {
    type,
    payload,
  };
}
