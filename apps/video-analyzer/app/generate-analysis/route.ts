import type { NextRequest } from 'next/server';
import { GenerateResponse } from 'ollama';
import Languages from '@repo/interfaces/languages';
import { DjangoDateTimeField } from '@repo/helpers/date-parser';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import UpdateAnalysisAttributes from '@/lib/update-analysis-attributes';
import OllamaQuery from '@repo/helpers/ollama';
import type { VideoAttributesType } from '@/state/video-type';

type GeneratePromptProps = {
  language?: Languages;
  characteristics: string;
  subtitles: string;
};

const GeneratePrompt = ({
  characteristics,
  subtitles,
}: GeneratePromptProps) => {
  // let prompt = 'Using this data:';
  // prompt = ` "${subtitles}", `;
  // prompt = `respond to the following prompt: ${characteristics}`;

  let prompt = '';
  prompt += 'The following text is transcription from a video: ';
  prompt += `"${subtitles}", `;
  prompt += 'Analize the video transcription and understand it. ';
  if (characteristics) {
    prompt += 'Analize and identify the language of the following request=';
    prompt += `"${characteristics}". `;
    prompt += 'With the knowledge from the analysis and yours,  ';
    prompt += 'respond to the request. ';
    prompt += 'If the request is in spanish, respond in spanish. ';
    prompt += 'If the request is in english, respond in english. ';
    prompt += 'You NEED to respond IN THE LENGUAGE of the request. ';
    // prompt += 'respond to the following questions or requests: ';
    // prompt += characteristics;
  } else {
    prompt += 'With the knowledge of the analysis and yours,  ';
    prompt += 'generate a meaningful summary. ';
  }
  prompt += 'Do not respond with analysis transcription. ';
  prompt += 'Do not respond the thinking process. ';
  prompt += 'Repond just with yout Final Answer.';

  return prompt;
};

type ProcessRequestProps = {
  id: string;
  videoAnalisysID: string;
};

const ProcessRequest = ({ id, videoAnalisysID }: ProcessRequestProps) => {
  console.log('> videoID:', id);
  console.log('> videoAnalisysID:', videoAnalisysID);

  GetVideoByID(id).then((video) => {
    const childrenIDs = video.relationships.analysis.data
      .map((i) => i.id)
      .join(',');
    console.log('> children IDs:', childrenIDs);
    const analysis = video.relationships.analysis.data.find(
      (i) => i.id === videoAnalisysID
    );

    const transcriptions = video.attributes.transcriptions;
    const attributes: VideoAttributesType = {
      logs: video.attributes.logs,
    };

    if (!analysis) {
      attributes.logs += `> NO analysis found!. \n\n`;
      attributes.logs += `> videoAnalisysID: ${videoAnalisysID}. \n\n`;
      attributes.logs += `> Video children: ${JSON.stringify(video.relationships.analysis.data.map((i) => i.id))}. \n\n`;
      attributes.status = 'error';
      UpdateVideoAttributes({
        id,
        attributes,
      }).catch((error) =>
        console.log('>> UpdateVideoAttributes error:', error)
      );
      return;
    }

    if (!transcriptions) {
      console.log('>>> NO clean_transcriptions:', video.id);
      attributes.status = 'error';
      UpdateVideoAttributes(video).catch((error) =>
        console.log('>> UpdateVideoAttributes error:', error)
      );
      analysis.attributes.status = 'error';
      analysis.attributes.logs += `> Video with no transcriptions. \n\n`;
      analysis.attributes.ended = DjangoDateTimeField(new Date().toString());
      UpdateAnalysisAttributes(analysis).catch((error) =>
        console.log('>> GetAnalysisByID error:', error)
      );
      return;
    }
    analysis.attributes.logs += '> processing! \n\n';
    analysis.attributes.started = DjangoDateTimeField(new Date().toString());
    // if (video.attributes.language) {
    //   analysis.attributes.language = video.attributes.language;
    // }
    analysis.attributes.worker_node = process.env.NODE_NAME || 'local';
    const prompt = GeneratePrompt({
      characteristics: analysis.attributes.requested_characteristics,
      subtitles: video.attributes.transcriptions.replace(/\n/, ''),
      // subtitles: video.attributes.clean_transcriptions.replace(/\n/, ''),
    });
    analysis.attributes.prompt = prompt;
    // analysis.attributes.prompt = analysis.attributes.requested_characteristics;
    // analysis
    //   .save(null, false)
    //   .catch((error) => console.log('>> analysis.save() error:', error));
    let system = 'You are an experienced and very skilled video analyst. ';
    system +=
      "Keep going until the job is completely solved before ending your turn. Use your tools, don't guess and don't hallucinate. Plan thoroughly before every tool call and reflect on the outcome after.";

    OllamaQuery({
      prompt: analysis.attributes.prompt,
      system,
    })
      .then((data: GenerateResponse) => {
        if (data && data.response) {
          analysis.attributes.summary = data.response;
          analysis.attributes.logs += '> ollamaQuery OK! \n';
          analysis.attributes.status = 'done';
          analysis.attributes.ended = DjangoDateTimeField(
            new Date().toString()
          );
        } else {
          analysis.attributes.summary = 'Error generating content!';
          analysis.attributes.status = 'error';
          analysis.attributes.logs += `> ollamaQuery empty: ${data} \n\n`;
          analysis.attributes.ended = DjangoDateTimeField(
            new Date().toString()
          );
        }
        UpdateAnalysisAttributes(analysis).catch((error) =>
          console.log('>> GetAnalysisByID error:', error)
        );
      })
      .catch((error) => {
        console.log('>> ollamaQuery error:', error);
        analysis.attributes.status = 'error';
        analysis.attributes.logs += `> ollamaQuery error: ${JSON.stringify(error)} \n\n`;
        analysis.attributes.ended = DjangoDateTimeField(new Date().toString());
        UpdateAnalysisAttributes(analysis).catch((error) =>
          console.log('>> GetAnalysisByID error:', error)
        );
      });
  });
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.videoID ?? null;
  const videoAnalisysID = body?.videoAnalisysID ?? null;
  if (!id || !videoAnalisysID) {
    return Response.json(
      {
        id,
        status: 'error',
        url: '',
        error: 'No prompt provided',
      },
      {
        status: 400,
      }
    );
  }

  ProcessRequest({
    id,
    videoAnalisysID: videoAnalisysID,
  });

  return Response.json({ data: 'processing' }, { status: 200 });
}
