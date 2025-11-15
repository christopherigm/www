// https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react';
import { type VideoType, DefaultVideo } from '@/state/video-type';
import { type VideoAnalysisType } from '@/state/analysis-type';

// type ActionMap<M extends { [index: string]: any }> = {
//   [Key in keyof M]: M[Key] extends undefined
//     ? {
//         type: Key;
//       }
//     : {
//         type: Key;
//         payload: M[Key];
//       }
// };

export const AddNewAnalysis = (
  video: VideoType,
  rawAnalysis: VideoAnalysisType
): VideoType => {
  const newAnalysis: Array<VideoAnalysisType> = [
    ...video.relationships.analysis.data,
    rawAnalysis,
  ];
  const relationships = {
    ...video.relationships,
    analysis: {
      data: newAnalysis,
    },
  };
  const newVideo = {
    ...video,
    relationships,
  };
  return newVideo;
};

export const DeleteNewAnalysis = (
  video: VideoType,
  index: number
): VideoType => {
  const relationships = video.relationships;
  relationships.analysis.data.splice(index, 1);
  const newVideo = {
    ...video,
    relationships,
  };
  return newVideo;
};

export type VideoActionTypes =
  | 'loading'
  | 'set-data'
  | 'patch-data'
  | 'new-analysis'
  | 'update-analysis'
  | 'delete-analysis';
type Action = {
  type: VideoActionTypes;
  id?: string;
  rawData?: VideoType;
  rawAnalysis?: VideoAnalysisType;
  isLoading?: boolean;
};
const Reducer = (video: VideoType, action: Action): VideoType => {
  switch (action.type) {
    case 'loading': {
      return { ...video, isLoading: action.isLoading ?? false };
    }
    case 'set-data': {
      if (action.rawData) {
        return {
          ...video,
          ...action.rawData,
        };
      }
      return { ...video };
    }
    case 'patch-data': {
      if (action.rawData && video.id === action.rawData.id) {
        return {
          ...video,
          ...action.rawData,
        };
      }
      return { ...video };
    }
    case 'new-analysis': {
      if (action.rawAnalysis) {
        const newVideo = AddNewAnalysis(video, action.rawAnalysis);
        return newVideo;
      }
      return video;
    }
    case 'update-analysis': {
      if (action.rawAnalysis) {
        const newAnalysis = video.relationships.analysis.data.map((i) => {
          if (i.id === (action.rawAnalysis as VideoAnalysisType).id) {
            return action.rawAnalysis as VideoAnalysisType;
          }
          return i;
        });
        const relationships = {
          ...video.relationships,
          analysis: {
            data: newAnalysis,
          },
        };
        return {
          ...video,
          relationships,
        };
      }
      return video;
    }
    case 'delete-analysis': {
      if (action.rawAnalysis) {
        const newAnalysis = video.relationships.analysis.data.map((i) => {
          if (i.id === (action.rawAnalysis as VideoAnalysisType).id) {
            return action.rawAnalysis as VideoAnalysisType;
          }
          return i;
        });
        const relationships = {
          ...video.relationships,
          analysis: {
            data: newAnalysis,
          },
        };
        return {
          ...video,
          relationships,
        };
      }
      return video;
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};

type ContextType = {
  video: VideoType;
  dispatch?: Dispatch<Action>;
};
const Context = createContext<ContextType | null>(null);

type Props = {
  children?: ReactNode | Array<ReactNode>;
};
export const VideoProvider = ({ children }: Props) => {
  const [video, dispatch] = useReducer(Reducer, DefaultVideo);
  // const store = useMemo(() => ({ video, dispatch }), [video]);
  return (
    <Context.Provider value={{ video, dispatch }}>{children}</Context.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(Context);
  if (context === null || !context.dispatch) {
    throw new Error('Context must be used within Provider');
  }
  const { video, dispatch } = context;
  return { video, dispatch };
};
