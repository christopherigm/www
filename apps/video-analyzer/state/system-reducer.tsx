// https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';

type System = {
  recordedPrompts: Array<string>;
};

const LocalStorageKey = 'recorded-prompts';

const DefaultState: System = {
  recordedPrompts: [],
};

export type ActionTypes = 'set-items' | 'add-item' | 'delete-item';
type Action = {
  type: ActionTypes;
  index?: number;
  newItem?: string;
  items?: Array<string>;
};
const Reducer = (state: System, action: Action): System => {
  switch (action.type) {
    case 'set-items': {
      let items: Array<string> = [];
      if (action.items) {
        items = action.items;
      }
      return { ...state, recordedPrompts: items };
    }
    case 'add-item': {
      const items = [...state.recordedPrompts];
      if (action.newItem) {
        items.push(action.newItem);
      }
      SetLocalStorageData(LocalStorageKey, JSON.stringify(items));
      return { ...state, recordedPrompts: items };
    }
    case 'delete-item': {
      const items = [...state.recordedPrompts];
      if (action.index !== undefined) {
        items.splice(action.index, 1);
      }
      SetLocalStorageData(LocalStorageKey, JSON.stringify(items));
      return { ...state, recordedPrompts: items };
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};

type ContextType = {
  state: System;
  dispatch?: Dispatch<Action>;
};
const Context = createContext<ContextType | null>(null);

type Props = {
  children?: ReactNode | Array<ReactNode>;
};
export const SystemProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(Reducer, DefaultState);

  useEffect(() => {
    const items: Array<string> = JSON.parse(
      GetLocalStorageData(LocalStorageKey) ?? '[]'
    );
    dispatch({ type: 'set-items', items });
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export const useSystemContext = () => {
  const context = useContext(Context);
  if (context === null || !context.dispatch) {
    throw new Error('Context must be used within Provider');
  }
  const { state, dispatch } = context;
  return { state, dispatch };
};
