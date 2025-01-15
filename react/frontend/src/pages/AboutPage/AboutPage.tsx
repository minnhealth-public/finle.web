import React, { } from "react";
import PartnerResults from "../../components/Partner/PartnerResults";
import { PageTitle } from "../../shared/View";

const AboutPage: React.FC = () => {
  return (
    <div id="about-page" className="container mx-auto p-4">
      <div className="flex flex-col space-y-8">
        <PageTitle>About</PageTitle>
        <div className="md:w-2/3 space-y-8">
          <p>
            <span className="font-semibold text-primary_alt">START Planning</span> is a website created with the intent of
            providing practical and essential planning information for people at any stage of the dementia diagnosis
            journey - even if you don’t know where to start.
          </p>
          <p>
            There are many articles, guides, and websites out on the Internet that provide information on individual
            topics or list steps caregivers should complete for proper planning. However, these resources lack
            personalization and prioritization, making these resources inaccessible and insufficient.
          </p>
          <p className="text-xl font-bold">
            Everybody’s situation is unique. <span className="font-semibold text-primary_alt">START Planning</span> offers
            a customized learning and planning experience, using to-do tasks and key profile information to determine
            priority of the delivered content.
          </p>
          <p>
            The to-do tasks were selected in partnership with professional advocates who ask these same questions to
            their clients every day. Based on how you’ve answered questions while setting up your profile and how you
            are doing on your to-do tasks, our video tool suggests content tailored towards your priorities. Our video
            content is in the form of digestible and engaging short videos that focus on just one topic at a time. If
            users desire more context around the short video, they can always navigate to a longer clip or the entire
            video.
          </p>
          <p>
            Effective planning often does not happen alone - that is why <span className="font-semibold text-primary_alt">
              START Planning</span> provides users with the ability to form a virtual “care team.” A care team, as used by
            this website, is typically made up of a person with dementia and their loved ones who want to be involved in
            the planning process. When a user interacts with the website by leaving comments on videos, sharing to-do
            tasks and glossary terms, or posting a question in Team Notes, members of their care team are automatically
            notified and can see the interaction documented in the Team Notes discussion forum. This allows every member
            of the care team to stay in the loop and collaborate on the planning process.
          </p>
          <p>
            From needing motivation to start planning to tying up loose ends, <span className="font-semibold text-primary_alt">
              START Planning</span> has the tools you need to feel empowered throughout your preparation journey.
          </p>
        </div>

        <h2 className="text-5xl text-header md:w-1/2">
          Partners
        </h2>
        <p className="md:w-1/2 font-bold text-lg">
          There is strength in sharing knowledge. We've come together to empower those living with dementia and their
          care partners.
        </p>
        <PartnerResults />
      </div>
    </div>
  )
}

export default AboutPage;
