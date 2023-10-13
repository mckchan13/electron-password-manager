function useFormChangeReducer() {
  return {
    createInitialState,
    formChangeReducer,
    actionCreator,
    ACTIONS,
  };
}

export default useFormChangeReducer;

const ACTIONS = {
  username: "USERNAME",
  password: "PASSWORD",
  secret: "SECRET",
  reset: "RESET",
  submit: "SUBMIT",
} satisfies Record<keyof FormData | "reset" | "submit", ActionType>;

function createInitialState() {
  return {
    username: "",
    password: "",
    secret: "",
  };
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
      return createInitialState();
    case "SUBMIT": {
      return state;
    }
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

export type FormData = ReturnType<typeof createInitialState>;

export type ActionType = Uppercase<keyof FormData> | "RESET" | "SUBMIT";

export type Action<T extends string = string, P = string> = {
  type: T;
  payload: P;
};
