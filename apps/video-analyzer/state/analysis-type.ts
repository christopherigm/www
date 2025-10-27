export const DefaultVideoAnalysisState = {
  type: 'VideoAnalisys',
  id: '1',
  isLoading: false,
  attributes: {
    enabled: true,
    order: 0,
    modified: '',
    version: 0,
    status: 'done',
    link: '',
    worker_node: '',
    started: '',
    ended: '',
    language: '',
    prompt: '',
    requested_characteristics: '',
    summary: '',
    logs: '',
    viewed: false,
    liked: false,
    shared: false,
    created: '',
  },
  relationships: { video: { data: { type: 'Video', id: '1' } } },
  links: { self: '' },
};

export type VideoAnalysisType = typeof DefaultVideoAnalysisState;
