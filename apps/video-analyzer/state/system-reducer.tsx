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
import GetBooleanFromString from '@repo/helpers/get-boolean-from-string';
import { BackgroundVideoType } from '@/state/background-video-type';
import { BackgroundMusicType } from '@/state/background-music-type';

type System = {
  animatedBackground?: boolean;
  recordedPrompts: Array<string>;
  backgroundVideos: Array<BackgroundVideoType>;
  backgroundMusic: Array<BackgroundMusicType>;
};

const LocalStorageKey = 'recorded-prompts';
const AnimatedBackgroundLocalStorageKey = 'animated-background';
// const BackgroundVideosLocalStorageKey = 'background-videos';

const DefaultState: System = {
  recordedPrompts: [],
  backgroundVideos: [],
  backgroundMusic: [],
};

export type ActionTypes =
  | 'set-items'
  | 'add-item'
  | 'delete-item'
  | 'set-animated-background'
  | 'set-background-videos'
  | 'set-background-music';
type Action = {
  type: ActionTypes;
  index?: number;
  newItem?: string;
  items?: Array<string>;
  backgroundVideos?: Array<BackgroundVideoType>;
  backgroundMusic?: Array<BackgroundMusicType>;
  animatedBackground?: boolean;
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
    case 'set-animated-background': {
      if (action.animatedBackground !== undefined) {
        SetLocalStorageData(
          AnimatedBackgroundLocalStorageKey,
          action.animatedBackground.toString()
        );
        return {
          ...state,
          animatedBackground: action.animatedBackground,
        };
      }
      return state;
    }
    case 'set-background-videos': {
      let backgroundVideos: Array<BackgroundVideoType> = [];
      if (action.backgroundVideos) {
        backgroundVideos = action.backgroundVideos;
      }
      return { ...state, backgroundVideos };
    }
    case 'set-background-music': {
      let backgroundMusic: Array<BackgroundMusicType> = [];
      if (action.backgroundMusic) {
        backgroundMusic = action.backgroundMusic;
      }
      return { ...state, backgroundMusic };
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

    const animatedBackground: boolean = GetBooleanFromString(
      GetLocalStorageData(AnimatedBackgroundLocalStorageKey) ?? 'true'
    );
    dispatch({ type: 'set-animated-background', animatedBackground });

    // const backgroundVideos: Array<BackgroundType> = JSON.parse(
    //   GetLocalStorageData(BackgroundVideosLocalStorageKey) ?? '[]'
    // );
    // dispatch({ type: 'set-background-videos', backgroundVideos });
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
