import React, { } from "react";
import Joyride, {EVENTS, CallBackProps, Locale, Step, ACTIONS} from 'react-joyride';

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'
import { useNavigate } from "react-router-dom";
import { useStore } from "../store.js";
import { logEventWithTimestamp } from "../lib/analytics";

const fullConfig: any = resolveConfig(tailwindConfig)

const WalkThrough: React.FC = () => {

  const { todos, clips, topics, tutorial, setTutorial, showTutorial, setShowTutorial } = useStore();

  const navigate = useNavigate();

  const locale: Locale = {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    open: 'Open the dialog',
    skip: 'Exit Walkthrough'
  }

  interface WalkthroughBannerProps {
    message: string;
  }

  const WalkthroughBanner: React.FC<WalkthroughBannerProps> = ({ message }) => {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          backgroundColor: '#fbbf24',
          color: '#000',
          padding: '12px',
          textAlign: 'center',
          zIndex: 1000,
        }}
      >
        {message}
      </div>
    );
  };

  const steps: Step[] = [
    {
      target: '#todo-title',
      content: 'This is the To Do page. Here is where you will find To Do tasks that help guide you through important preparedness steps. If you complete all of these tasks, you are in good shape. You can view your tasks by suggested priority or by category. By default, they are in the prioritized list.',
      disableBeacon: true,
    },
    {
      target: '#categoryView',
      content: 'Click this button to view the To Do list by category.',
      spotlightClicks: true,
    },
    {
      target: '#listView',
      content: 'Click this button to go back to the prioritized list.',
      spotlightClicks: true,
    },
    {
      target: '#todo-0', // 3
      content: 'Now let\'s check out of your To Do tasks. Click on the title, description, or START button on the first task.',
      spotlightClicks: true,
      spotlightPadding: 0,
    },
    {
      target: '#todo-title',
      content: 'We’ve moved to a task page. Here you can read about this task, answer questions, and find related content.',
    },
    {
      target: '#todo-form',
      content: 'Read about the task and answer any questions. Click ‘Submit’ when you want to save your answers.',
      placement: "top"
    },
    {
      target: '#todo-supplemental',
      content: 'Over here, you can see actions you can perform and resources related to this task.',
      placement: "top"
    },
    {
      target: '#todo-recommended',
      content: 'If you want to watch a video that relates to this task, click one of the thumbnail in this section.',
      placement: "top",
      spotlightClicks: true,
    },
    {
      target: '#videos-nav', // 8
      content: 'Now that we’ve checked out a task page, let\'s see what the Videos page is all about. Click here to navigate to the Videos page.',
      spotlightClicks: true,
    },
    {
      target: '#videos-list-title',
      content: 'This is the Videos page. This page contains our entire collection of short videos.',
    },
    {
      target: '#start-watching',
      content: 'Clicking this Play button will take you to the first video that we recommended for you.',
    },
    {
      target: '#recommended',
      content: 'This section shows you our top recommended videos for you.',
      placement: "top"
    },
    {
      target: '#video-search',
      content: 'Search for videos by typing into this search bar.',
      placement: "right"
    },
    {
      target: '#watched-saved-filters',
      content: 'Filter the videos by ones you have already watched and/or ones you have saved.',
    },
    {
      target: '#topic-filters', // 14
      content: 'Select these filters to narrow your search by broad topic. Let’s see it in action: turn on the ‘Legal’ filter. After doing so, you will see task filters appear and only videos that provide legal information will be shown.',
      spotlightClicks: true,
    },
    {
      target: '#task-filters', // 15
      content: 'After selecting a topic, you can further filter by selecting one or more tasks. Enabling a task filter will narrow the video list down to videos that relate to that task. Select any of the task filters. ',
      spotlightClicks: true,
      placement: "bottom-start"
    },
    {
      target: '#reset-button', // 16
      content: 'Reset the search or filters by clicking here.',
      spotlightClicks: true,
      placement: "bottom-start"
    },
    {
      target: '#recommended', // 17
      content: 'Click on the first recommended video so we can check out a video page.',
    },
    {
      target: '#clip-title',
      content: 'We are now on a video page, where much of the learning happens. Continue on to walk through this page.',
    },
    {
      target: '#clip-tabs',
      content: 'On each video page, you will see 3 tabs.',
    },
    {
      target: '#short-tab',
      content: 'The first tab (Preview) has a video that usually is 90 seconds or shorter. These videos serve to capture your attention and guide you towards information that is most useful to you.',
    },
    {
      target: '#medium-tab',
      content: 'The second tab (Highlight) has a video that contains the scene from the Preview tab. This medium video is available to provide you with more context around the information provided in the preview.',
    },
    {
      target: '#long-tab',
      content: 'The third tab (Full-Length) will have the entire video from which the highlight video was extracted. This full-length video is there to give you supplemental information from the same source. '
    },
    {
      target: '#clip-tabs',
      content: 'Note that some preview videos will not show highlight and full-length videos in those tabs. This is because they don’t exist, and in this case, those tabs will suggest other preview videos for you to explore.',
    },
    {
      target: '#video-play-button', // 24
      content: 'Click the play button to start the video.',
    },
    {
      target: '#player-wrapper',
      content: 'Hover over the video to bring up the controls. You can pause, rewind 10 seconds, and skip forward 10 seconds.'
    },
    {
      target: '#progress-bar',
      content: 'See the progress of your video here. Drag the circle or click on the progress bar to skip to that time.',
      spotlightClicks: true,
    },
    {
      target: '#key-takeaways',
      content: 'On each video tab, you will find the video’s important points, what we call \'key takeaways.\'',
    },
    {
      target: '#rating',
      content: 'Under each video, you can leave a helpfulness rating. This rating helps inform us what videos are most helpful to our users. It also tells us what types of videos are most helpful to you.',
      placement: "top-start"
    },
    {
      target: '#related-todos',
      content: 'On the Preview tab, you will also find any tasks that relate to the current video. You can click on any of these tasks to navigate to its respective page.',
      placement: 'bottom'
    },
    {
      target: '#notes',
      content: 'You can leave a note on each video here. Notes are shared with your team - we will look at the My Notes section of this tool later in this tutorial.',
      placement: 'bottom'
    },
    // {
    //   target: '#save-video',
    //   content: 'Click this save button to save this video for your reference.',
    // },
    {
      target: '#next-thumbnail', // 31
      content: 'Move on to the next recommended video by clicking this thumbnail...',
      spotlightClicks: true,
    },
    {
      target: '#previous-thumbnail', // 32
      content: 'Or move back to the previous video by clicking this thumbnail.',
      spotlightClicks: true,
      disableBeacon: true
    },
    {
      target: '#tools-nav', // 33
      content: 'Now that you’ve explored videos, let\'s go check out the Glossary. Hover or click on Tools, then select Glossary.',
      spotlightClicks: true,
      placement: 'left-start',
    },
    {
      target: '#glossary-title',
      content: 'We provide you with a glossary because there are lots of confusing or uncommon words in this legal and financial planning space. By default, all glossary terms are shown.',
    },
    {
      target: '#glossary-0', // 35
      content: 'Select a letter to show only terms that start with that letter.',
      spotlightClicks: true,
    },
    {
      target: '#term-0',
      content: 'Click on a term to bring up the definition.',
      placement: 'right',
      spotlightClicks: true,
    },
    {
      target: '#tools-nav', // 37
      content: 'Let\'s move on to the Resources page. Hover or click on Tools, then select Resources.',
      spotlightClicks: true,
      placement: 'left-start',
    },
    {
      target: '#resources-title',
      content: 'On this page, we have helpful resources at your disposal to read and/or print. Like the videos page, ' +
        'you can search and filter the resources.',
    },
    {
      target: '#resource-0',
      content: 'Click on one of the resources. You can open the resource or leave a note to your team with ' +
        'the resource as an attachment.',
      spotlightClicks: true,
    },
    {
      target: '#tools-nav', // 40
      content: 'Now let\'s check ouheadert the Team Notes page. Hover or click on Tools, then select Team Notes.',
      spotlightClicks: true,
      placement: 'left-start',
    },
    {
      target: '#notes-title',
      content: 'Notes are how you communicate with your team. Anything you share or comments you make on videos will show up here in Team Notes.',
      placement: 'bottom-start',
    }, // TODO: add more steps in My Notes
    {
      target: '#howitworks-nav', // 42
      content: 'Let\'s check out the other pages. Click on How It Works.',
      spotlightClicks: true
    },
    {
      target: '#howitworks-breakdown',
      content: 'Here is a small summary of each feature within our tool, each linking to their respective pages.',
    },
    {
      target: '#start-tutorial',
      content: 'If you ever want to do this tutorial again, come to this page and click this play button. This tutorial will start from the beginning.',
    },
    // {
    //   target: '#about-nav',
    //   content: 'Let’s go to the About page now.',
    //   disableBeacon: true,
    //   spotlightClicks: true
    // },
    // {
    //   target: '#about-page',
    //   content: 'Visit this page when you want to read about us and our partners who have worked hard to create this tool for you!',
    //   disableBeacon: true,
    //   disableOverlay: true
    // },
    {
      target: '#header',
      content: 'Almost done! Let\'s take a look at a few more things that you may find useful.',
      placement: "center"
    },
    {
      target: '#font-adjustor',
      content: 'You may have been wondering what this button does. Once you click on it, you can use the slider to adjust the font size to your preference. Click the icon again to hide the slider.',
      spotlightClicks: true,
      offset: 30
    },
    {
      target: '#team-selector',
      content: 'If you are part of more than one team, this will be a dropdown where you can select which team you’re currently working with. ',
    },
    {
      target: '#profile-nav', // 48
      content: 'Go to your Account page by hovering over your profile icon and selecting Account.',
      spotlightClicks: true,
      placement: 'left-start',
      offset: 30
    },
    {
      target: '#my-teams',
      content: 'Here is where you manage your team settings. Edit the team name, delete the team, invite new members, or create a whole new team.',
    },
    {
      target: '#my-info',
      content: 'Edit any personal information here.',
    },
    {
      target: '#profile-nav',
      content: 'Finally, sign out later by hovering over your profile icon and selecting Logout. This walkthrough is over now, ' +
          'hope you enjoy this tool!',
      placement: 'left-start',
      offset: 30
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, type, step } = data;

    const navigateAndSetTutorial = (path: string, targetIndex: number) => {
      navigate(path);
      setTimeout(() => {
        setTutorial({ run: true, stepIndex: targetIndex })
        if ( targetIndex == 32){
          navigate(0);
        }
      }, 500)
    };

    const handleStepBefore = () => {
      console.log(tutorial.stepIndex)
      const clickableIndices = [3, 8, 14, 15, 16, 17, 24, 31, 32, 33, 35, 47, 40, 42, 48];
      if (clickableIndices.includes(index)) {
        const elm = document.querySelector(step.target);
        console.log(elm)
        elm?.addEventListener("click", () => {
          setTutorial({ run: true, stepIndex: tutorial.stepIndex + 1 });
        });
      }
    };

    const handleStepAfter = () => {
      switch (index) {
        case 3:
          if (action == ACTIONS.PREV) {
            setTutorial({run: true, stepIndex: index - 1});
          } else {
            navigateAndSetTutorial(`/todos/${todos[0].id}`, index + 1);
          }
          break;
        case 4:
          if (action == ACTIONS.PREV) {
            navigateAndSetTutorial(`/todos/`, index - 1);
          } else {
            setTutorial({run: true, stepIndex: index + 1});
          }
          break;
        case 8:
          if (action == ACTIONS.PREV) {
            navigateAndSetTutorial(`/todos/${todos[0].id}`, index - 1);
          } else {
            navigateAndSetTutorial(`/videos?page=1`, index + 1);
          }
          break;
        case 14:
          let legal_id = topics.find(topic => topic.name === "Legal").id;
          navigateAndSetTutorial(`/videos?topics=${legal_id}`, index + 1);
          break;
        case 15:
          let topic_id = topics.find(topic => topic.name === "Legal").id;
          let task_id = todos.find(todo => todo.topic.id === topic_id).id;
          navigateAndSetTutorial(`/videos?topics=${topic_id}&tasks=${task_id}`, index + 1);
          break;
        case 16:
          navigateAndSetTutorial(`/videos?page=1`, index + 1);
          break;
        case 17:
          navigateAndSetTutorial(`/videos/${clips[0].id}`, index + 1);
          break;
        case 24:
          console.log("play button clicked")
          break;
        case 31:
          console.log(`31 setting path to /videos/${clips[1].id}?idx=1`)
          navigateAndSetTutorial(`/videos/${clips[1].id}?idx=1`, index + 1);
          break;
        case 32:
          console.log(`32 setting path to /videos/${clips[0].id}?idx=1`)
          navigateAndSetTutorial(`/videos/${clips[0].id}?idx=1`, index + 1);
          break;
        case 33:
          navigateAndSetTutorial(`/glossary`, index + 1);
          break;
        case 35:
          navigateAndSetTutorial(`/glossary?letterGroup=A`, index + 1);
          break;
        case 37:
          navigateAndSetTutorial(`/resources`, index + 1);
          break;
        case 40:
          navigateAndSetTutorial(`/my-notes`, index + 1);
          break;
        case 42:
          navigateAndSetTutorial(`/how-it-works`, index + 1);
          break;
        case 46:
          navigateAndSetTutorial(`/account`, index + 1);
          break;
        default:
          if (action == ACTIONS.PREV) {
            setTutorial({run: true, stepIndex: tutorial?.stepIndex - 1});
          } else {
            setTutorial({run: true, stepIndex: tutorial?.stepIndex + 1});
          }
          break;
      }
    }

    switch (type) {
      case EVENTS.STEP_BEFORE:
        handleStepBefore();
        break;
      case EVENTS.STEP_AFTER:
        handleStepAfter();
        break;
      case EVENTS.TOUR_END:
        logEventWithTimestamp('tutorial_ended', {});
        setShowTutorial(false);
        break;
      default:
        break;
    }
  }

  return <>
    {showTutorial && (
      <WalkthroughBanner message="You are in a walkthrough. Follow the steps to learn more!" />
    )}

    {showTutorial &&
      <Joyride
        run={tutorial?.run}
        continuous
        disableOverlay
        disableScrolling={false}
        disableOverlayClose
        showSkipButton
        hideBackButton // TODO: back button implementation in progress.
        stepIndex={tutorial?.stepIndex}
        locale={locale}
        styles={{
          options: {
            primaryColor: fullConfig.theme.colors.primary,
          },
          tooltipContent: {
            fontSize: '20px',
          },
          buttonSkip: {
            fontSize: '20px',
            color: fullConfig.theme.colors.header
          },
          buttonNext: {
            fontSize: '24px',
          },
        }}
        callback={handleJoyrideCallback}
        steps={steps} />
    }
  </>

}

export default WalkThrough;
