import React from "react";
import { PageTitle } from "../shared/View";
import { PlayIcon } from "../shared/Icon";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { logEventWithTimestamp } from "../lib/analytics";


interface LinkCardProps {
  link: string
  title: string
  description: string
}

const LinkCard: React.FC<LinkCardProps> = ({ link, title, description }) => {
  return (
    <div className="p-8 group hover:bg-tan-100">
      <Link className="flex flex-col" to={link}>
        <h4 className="text-5xl font-semibold mb-2 group-hover:text-primary_alt">{title}</h4>
        <p className="text-xl">{description}</p>
      </Link>
    </div>
  )
}

const HowItWorksPage: React.FC = () => {
  const { setShowTutorial, setTutorial } = useStore()
  const navigate = useNavigate()

  const onTutorialStart = () => {
    logEventWithTimestamp('tutorial_started', {})
    setShowTutorial(true);
    setTutorial({ run: true, stepIndex: 0 });
    navigate('/todos');
  }

  return (
    <div className="container mx-auto mb-14">
      <div className="md:basis-2/5 mt-6 space-y-4">
        <PageTitle>How It Works</PageTitle>
      </div>
      <div className="md:flex items-center">
        <p className="font-bold basis-1/2 py-3 text-3xl">
          Welcome to START Planning, where we aim to simplify your financial and legal planning
        </p>

        <div className=" flex md:basis-1/2">
          <div className="flex-grow"></div>
          <div id="start-tutorial" className="flex items-center my-4 bg-white-50 p-8 py-10 rounded-lg bg-opacity-75">
            <button onClick={onTutorialStart} className="group flex gap-4">
              <div className="text-primary_alt w-16 group-hover:text-primary">
                <PlayIcon />
              </div>
              <div className="flex-col font-bold text-xl font-arial group-hover:underline ">
                <p>Click here to start a<br></br> walkthrough of the site</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div id="howitworks-breakdown">
        <h3 className="text-3xl my-10">
          Below is a breakdown of how our tool works:
        </h3>
        <div className="flex flex-col px-4 mb-16 ">
          <LinkCard
            link="/todos"
            title={"To Do List"}
            description={"Our To Do list helps to simplify the steps needed for financial and legal planning."}
          />
          <div className="border-b-2 border-primary"></div>
          <LinkCard
            link="/videos"
            title={"Personalized Video Recommendations"}
            description={"We recommend videos based on your To Do list."}
          />
          <div className="border-b-2 border-primary"></div>
          <LinkCard
            link="/account"
            title={"Your Team"}
            description={"You can invite people to join your team like a spouse or partner, parent, sibling, an adult child, or close friend who will help you with legal and financial planning."}
          />
          <div className="border-b-2 border-primary"></div>
          <LinkCard
            link="/my-notes"
            title={"Shared Notes"}
            description={"With our shared notes feature, you can collaborate with your team in real-time. You can share important information, To Do list items, videos, and resources."}
          />
          <div className="border-b-2 border-primary"></div>
          <LinkCard
            link="/glossary"
            title={"Glossary"}
            description={"Encountering confusing terms shouldn't hinder your progress. Our comprehensive glossary provides definitions and explanations."}
          />
          <div className="border-b-2 border-primary"></div>
          <LinkCard
            link="/resources"
            title={"Resources"}
            description={"Expand your knowledge and preparation beyond our platform with our collection of external resources. Explore, download, and print valuable materials to supplement your journey."}
          />
        </div>
      </div>
    </div >
  )
}

export default HowItWorksPage;
