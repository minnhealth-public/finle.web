import React, { useState } from 'react';
import { Carousel } from '../shared/View';
import VideoCard from '../components/VideoCard/VideoCard';
import { Story, Video } from '../models';
import { useQuery } from '@tanstack/react-query';
import { getStories } from '../api/stories';
import SuccessStory from '../components/SuccessStory/SuccessStory';
import { getFeaturedShorts } from "../api/shorts";
import Scroller from '../shared/View/Scroller';
import { Link } from 'react-router-dom';

/// images
import pageHeader from '../images/mainpage-header.png';
import testimonial from '../images/mainpage-testimonial.png';
import section1 from '../images/mainpage-section1.png';
import howtoPlaceholder from '../images/mainpage-howtovideo-placeholder.png';
import features1 from '../images/mainpage-features-image1.png';
import features2 from '../images/mainpage-features-image2.png';
import features3 from '../images/mainpage-features-image3.png';
import ChevronIcon from '../shared/Icon/ChevronIcon';


type MainPagePreAuthProps = {
  className?: string
}

const MainPagePreAuth: React.FC<MainPagePreAuthProps> = ({ className }) => {
  const [partners, setPartners] = useState([{ name: "Partner One" }, { name: "Partner Two" },
  { name: "Partner Three" }, { name: "Partner Four" }, { name: "Partner Five" }])

  const storiesQuery = useQuery<Story[], Error>({
    queryKey: ["stories"],
    queryFn: getStories
  });

  const featuredShortsQuery = useQuery<Video[], Error>({
    queryKey: ["featuredShorts"],
    queryFn: getFeaturedShorts
  });

  const backgroundImageHeader = {
    backgroundImage: `url('${pageHeader}')`
  };

  const showFeaturedShorts = () => {
    if (featuredShortsQuery.isLoading) {
      return <h2>Is Loading</h2>
    } else if (featuredShortsQuery.error) {
      console.error("Failed to fetch featured shorts.")
      console.error("Error occurred while fetching featured shorts from /api/shorts/featured: ",
        featuredShortsQuery.error);
      return <h2>Error</h2>
    } else {
      // filter videos from the url params
      const featuredVideos: Video[] = featuredShortsQuery.data || [];
      return <>
        {featuredVideos?.map((video, index) => (
          <VideoCard key={index} video={video} showTopicOverlay={false} isModal />
        ))}
      </>
    }
  }

  const FeaturedVideos = () => {
    return (
      <>
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {showFeaturedShorts()}
        </div>
      </>
    );
  }

  const SuccessStoriesCarousel = () => {
    if (storiesQuery.isLoading) return "...";
    if (storiesQuery.isError) return <></>;
    return (
      <Carousel>
        {storiesQuery.data.map((story: Story, idx: number) => {
          return <div key={idx}><SuccessStory story={story}></SuccessStory></div>
        })}
      </Carousel>
    );
  }

  const Testimonials = () => {
    return (
      <div className="flex items-center py-3">
        <img src={testimonial} alt="testimonial-profile-pic" className="w-20 h-20 mr-3" />
        <div className="px-3">
          <p className="font-bold pb-2 text-xl">
            I am so thankful for this tool. It helped my family get through my mother's dementia diagnosis
            without the stress and anxiety that we expected.
          </p>
          <p className="text-lg">
            Joseph Arnold
          </p>
        </div>
      </div>
    );
  }

  const Partners = () => {
    return (
      partners.map((partner, index) => {
        return (
          <p key={index} className="text-center font-bold font-rounded">
            {partner.name}
          </p>
        );
      })
    );
  }

  return (
    <div id="MainPageWrapper" className={`${className}`}>
      <div id="MainPagePreAuthHeader" className="bg-cover bg-no-repeat" style={backgroundImageHeader}>
        <div className="container mx-auto pt-40 lg:pt-56 pb-20 text-white-1" id="MainPagePreAuthHeaderText">
          <div className="flex">
            <h2 className="mb-8 text-7xl basis-1/2">
              Plan today. Peace of mind tomorrow.
            </h2>
          </div>
          <div className="flex">
            <p className="font-semibold md:basis-1/2 text-3xl">
              We help people living with dementia and their families better understand what they need to
              know around the topics of financial and legal planning.
            </p>
          </div>
          {/*<div className="flex items-center py-6 lg:pb-20">*/}
          {/*  <Link className="btn-primary !text-lg" to={'about'} >Find Out More</Link>*/}
          {/*</div>*/}
          <Link
            id="MainPagePreAuthHeaderButton"
            className="link-primary text-xl flex py-6 lg:pb-20"
            to={'/about'}
          >
            find out more <div className="w-[0.5em] ml-2 rotate-180 text-color-400 "><ChevronIcon /></div>
          </Link>
        </div>
      </div>
      <div id="MainPagePreAuthSection1" data-bs-spy="scroll" data-bs-target="MainPagePreAuthHeaderButtons" className="container mx-auto pt-20">
        <div id="MainPagePreAuthSection1Content" className="md:flex gap-16 items-center">
          <div className="basis-1/2">
            <img src={section1} alt="two women smiling" />
          </div>
          <div id="MainPagePreAuthSection1Text" className="basis-1/2 flex flex-col gap-3">
            <h2 className="text-4xl text-header">
              Information is Empowering
            </h2>
            <p className="font-bold text-xl">
              This free tool provides easy-to understand information that can guide the decisions you need to make around financial and legal planning.
            </p>
            <p className="text-lg">

              We’ve curated information specific for those living with dementia and those who care and support them.

              {/*<br></br>*/}
              {/*<br></br>*/}
              {/*Watch the START Planning video for a walkthrough of our tool and website: { /* <Insert Play Button> *!/*/}

              <br></br>
              <br></br>
              If you sign up, we will help you identify topics that are important to you and your situation. We will help you organize and track key pieces of information. You can create a team and share information amongst members of your team.

            </p>
            <div>
              <Link
                id="MainPagePreAuthSection1SignUpButton"
                className="link-primary text-xl flex"
                // to={'/setup'}
                to={'/'}
              >
                sign up  <div className="w-[0.5em] ml-2 rotate-180 text-color-400 "><ChevronIcon /></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div id="MainPagePreAuthSection2" className="container mx-auto pt-20 flex flex-col gap-3">
        <h2 className="text-4xl text-header">
          Sample our Video Library
        </h2>
        <p className="font-bold md:w-4/5 text-xl">
          We have video resources that can help you better understand topics important to you. Search or browse our video library or let us suggest videos based on your profile.

        </p>
        <p className="text-lg">Sample some of the videos by clicking any of the below thumbnails.</p>
        <div id="MainPagePreAuthFeaturedVideos" className="flex gap-3">
          <FeaturedVideos />
        </div>
      </div>

      <div id="MainPagePreAuthSection4" className="py-20">
        <div className="container mx-auto flex flex-col gap-y-8">
          <h2 className="text-4xl text-header text-center">
            Stories from Real People
          </h2>
          <div id="MainPagePreAuthSuccessStoriesCarousel" >
            <SuccessStoriesCarousel />
          </div>
        </div>
      </div>
      <div id="MainPagePreAuthSection5" className="bg-white-50 bg-opacity-50 py-20">
        <div className="container mx-auto flex flex-col gap-y-8">
          <h2 className="text-4xl text-header text-center">
            Benefits of <span className="font-semibold text-primary_alt">START Planning</span>
          </h2>
          <div id="MainPagePreAuthSection5Feature1" className="md:flex items-center gap-16">
            <div className="basis-1/2">
              <img src={features1} alt="care team benefit" className="" />
            </div>
            <div className="basis-1/2 flex flex-col gap-y-3">
              <h2 className="text-3xl text-header">
                Work together with your team.
              </h2>
              <p className="text-lg">

                A person living with dementia as well as those who support them can all become better informed by using our planning tool. Anyone on a team can use the <Link
                  className="link-primary !lowercase"
                  to={'/my-notes'}
                >Team Notes</Link> feature to share information.

              </p>
            </div>
          </div>
          <div id="MainPagePreAuthSection5Feature2" className="flex items-center gap-4">
            <div className="basis-1/2 flex flex-col gap-y-3">
              <h2 className="text-3xl text-header">
                Our unique tool gives you access to…
              </h2>
              <ul className="list-disc list-outside text-lg pl-5">
                <li >Short videos identified specifically for you.</li>
                <li>A To Do List to help keep you organized.</li>
                <li>A glossary for understanding confusing terms.</li>
                <li>Notes that are shared among your team.</li>
                <li>External resources available to explore, download, and/or print.</li>
              </ul>
            </div>
            <div className="basis-1/2">
              <img src={features2} alt="care team benefit" className="" />
            </div>
          </div>
          <div id="MainPagePreAuthSection5Feature3" className="flex items-center gap-16">
            <div className="basis-1/2">
              <img src={features3} alt="care team benefit" className="" />
            </div>
            <div className="basis-1/2 flex flex-col gap-y-3">
              <h2 className="text-3xl text-header">
                Prepare for your future.
              </h2>
              <p className="text-lg">
                Early planning provides the opportunity to gather information, make plans, and communicate decisions in a stress-free time.
              </p>
            </div>
          </div>
          <div id="MainPagePreAuthSection5Disclaimer" className="flex items-center">
            <p className="text-lg">
              While this tool and website covers a range of financial and legal topics, we cannot address every possible question or situation. Nothing can replace personal, professional guidance from a lawyer or financial planner about your unique situation. We have included some trusted links in the
              <Link className="link-primary !lowercase px-1" to={'/resources'}>
                Resources
              </Link>section to help you find that guidance even if you have limited income.
            </p>
          </div>
        </div>
      </div>
      <div id="MainPagePreAuthSection6" className="container mx-auto py-20">
        <h2 className="text-4xl text-header">
          What people have to say
        </h2>
        <Testimonials />
      </div>
      <Scroller ids={["MainPagePreAuthSection1", "MainPagePreAuthSection2", "MainPagePreAuthSection4", "MainPagePreAuthSection5", "MainPagePreAuthSection6"]} />
    </div>
  )
}

export default MainPagePreAuth
