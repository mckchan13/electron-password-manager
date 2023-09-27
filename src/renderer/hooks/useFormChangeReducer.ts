export type FormData = ReturnType<typeof createInitialState>;

export type ActionType = keyof FormData | "reset";

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
    case "username":
      return {
        ...state,
        username: action.payload,
      };
    case "password":
      return {
        ...state,
        password: action.payload,
      };
    case "secret":
      return {
        ...state,
        secret: action.payload,
      };
    case "reset":
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
