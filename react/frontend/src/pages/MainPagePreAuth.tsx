import React, {useState} from 'react';
import {Carousel} from '../shared/View';
import VideoCard from '../components/VideoCard';
import { ArrowDownCircle } from '../shared/Icon';
import { Story, Video } from '../models';
import { useQuery } from '@tanstack/react-query';
import { getStories } from '../api/stories';
import SuccessStory from '../components/SuccessStory';
import {getShorts} from "../api/shorts";
const MainPagePreAuth: React.FC = () => {
    const [featuredVideos, setFeaturedVideos] = useState([{}, {}, {}, {}]) // Update to fetch featured videos in useEffect
    const [partners, setPartners] = useState([{name: "Partner One"}, {name: "Partner Two"},
        {name: "Partner Three"},{name: "Partner Four"},{name: "Partner Five"}])

    const storiesQuery = useQuery<Story[], Error>({
      queryKey: ["stories"],
      queryFn: getStories
    });

    // TODO: replace with featured video query
    const shortsQuery = useQuery<Video[], Error>({
        queryKey: ["shorts"],
        queryFn: getShorts
    });

    const backgroundImageHeader= {
        backgroundImage: "url('/mainpage-header.png')"
    };

    const showShorts = () => {
        if (shortsQuery.isLoading){
            return <h2>Is Loading</h2>
        } else if (shortsQuery.error){
            console.error("Failed to fetch shorts.")
            console.error("Error occurred while fetching shorts from /api/shorts: ", shortsQuery.error);
            return <h2>Error</h2>
        } else {
            // filter videos from the url params
            const allVideos: Video[] = shortsQuery.data;
            const featuredVideos: Video[] = allVideos.filter((video, index) => index < 4)
            return <>
                {featuredVideos.map((video, index) => (
                    <VideoCard key={index} video={video}/>
                ))}
            </>
        }
    }

    const FeaturedVideos = () => {
        // return (
        //     featuredVideos.map((video: Video, idx: number) => {
        //         const videoThumbnailUrl = '/mainpage-thumbnail-placeholder.png';
        //         return <VideoCard key={idx} video={video}></VideoCard>
        //    })
        // );
        return (
        <>
          <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {showShorts()}
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
                    return <SuccessStory key={idx} story={story}></SuccessStory>
                })}
            </Carousel>
        );
    }

    const Testimonials = () => {
        return (
            <div className="flex items-center py-3">
                <img src="/mainpage-testimonial.png" alt="testimonial-profile-pic" className="w-20 h-20 mr-3"/>
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
        <div id="MainPageWrapper">
            <div id="MainPagePreAuthHeader" className="bg-cover bg-no-repeat" style={backgroundImageHeader}>
                <div className="container mx-auto py-40 text-white-1" id="MainPagePreAuthHeaderText">
                    <div className="flex">
                        <h2 className="mb-8 text-6xl basis-1/2">
                            Plan today. Peace of mind tomorrow.
                        </h2>
                    </div>
                    <div className="flex">
                        <p className="font-semibold basis-1/3">
                            We help people with dementia get started with financial, legal, medical, and care planning.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-teal-500 hover:bg-teal-400 rounded py-2 px-4" >Sign Up</button>
                        <button className="bg-teal-500 hover:bg-teal-400 rounded py-2 px-4" >Find Out More</button>
                        <a className="" href="#MainPagePreAuthSection1">
                            <ArrowDownCircle/>
                        </a>
                    </div>
                </div>
            </div>
            <div id="MainPagePreAuthSection1" data-bs-spy="scroll" data-bs-target="MainPagePreAuthHeaderButtons" className="container mx-auto pt-20">
                <div id="MainPagePreAuthSection1Content" className="flex gap-16 items-center">
                    <div className="basis-1/2">
                        <img src="/mainpage-section1.png" alt="two women smiling"/>
                    </div>
                    <div id="MainPagePreAuthSection1Text" className="basis-1/2 flex flex-col gap-3">
                        <h2 className="text-3xl text-blue-450">
                            Age with confidence
                        </h2>
                        <p className="font-bold text-xl">
                            If you are a person with mild cognitive impairment or dementia (or a care partner,
                            family member, friend, or professional advocate), <span className="text-teal-500">we’re glad
                            you’re here!</span>
                        </p>
                        <p>
                            This website can help you get started with many financial, legal, medical, and care planning
                            topics. <br/><br/> We’ll help you pick a topic, stay organized, find answers from the experts,
                            and celebrate progress.
                        </p>
                        <div>
                            <a id="MainPagePreAuthSection1SignUpButton" className="flex text-teal-500 hover:text-teal-400">
                                <span className="font-bold uppercase">sign up {'>'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div id="MainPagePreAuthSection2" className="container mx-auto py-20 flex flex-col gap-2">
                <h2 className="text-3xl text-blue-450">
                    Explore our video library
                </h2>
                <p className="font-bold md:w-4/5">
                    Whether you are a clinician, a care partner, or someone living with dementia, we have video
                    resources that can help with your planning.
                </p>
                <p>Check out our robust video library by clicking any of the below videos.</p>
                <div id="MainPagePreAuthFeaturedVideos" className="flex gap-3">
                    <FeaturedVideos />
                </div>
            </div>
            <div id="MainPagePreAuthSection3" className="bg-white-50 bg-opacity-50 py-20">
                <div className="container mx-auto flex items-center flex-col gap-3 ">
                    <h2 className="text-3xl text-blue-450 text-center">
                        How to Use START Planning
                    </h2>
                    <p id="MainPagePreAuthSection3Text" className="text-center">
                        Watch the video below for a walkthrough of the site. This video will show you how to get the most out of all the features of the site.
                    </p>
                    <img id="MainPagePreAuthSection3Video" src="/mainpage-howtovideo-placeholder.png" alt="placeholder for how-to video" />
                </div>
            </div>
            <div id="MainPagePreAuthSection4" className="py-20">
                <div className="container mx-auto flex flex-col gap-y-8">
                    <h2 className="text-3xl text-blue-450 text-center">
                        Motivational Stories
                    </h2>
                    <div id="MainPagePreAuthSuccessStoriesCarousel" >
                        <SuccessStoriesCarousel />
                    </div>
                </div>
            </div>
            <div id="MainPagePreAuthSection5" className="bg-white-50 bg-opacity-50 py-20">
                <div className="container mx-auto flex flex-col gap-y-8">
                    <h2 className="text-3xl text-blue-450 text-center">
                        Discover Benefits
                    </h2>
                    <div id="MainPagePreAuthSection5Feature1" className="flex items-center gap-16">
                        <div className="basis-1/2">
                            <img src="/mainpage-features-image1.png" alt="care team benefit" className="" />
                        </div>
                        <div className="basis-1/2 flex flex-col gap-y-3">
                            <h2 className="text-3xl text-blue-450">
                                Establish your care team.
                            </h2>
                            <p className="font-bold text-xl">
                                It's nearly impossible to tackle the challenges of aging without help.
                            </p>
                            <p>
                                Establish a support team and help them understand your plan and values – who you are and what you look forward to as you age. Use our chat and messaging functions to share information.
                            </p>
                        </div>
                    </div>
                    <div id="MainPagePreAuthSection5Feature2" className="flex items-center gap-4">
                        <div className="basis-1/2 flex flex-col gap-y-3">
                            <h2 className="text-3xl text-blue-450">
                                Build your knowledge.
                            </h2>
                            <p className="font-bold text-xl">
                                Feel confident about your understanding of the complexities surrounding dementia.
                            </p>
                            <p>
                                Utilize our learning features and watch short videos – catered just for you. Organize tasks and documents, and use the glossary to understand confusing terms.
                            </p>
                        </div>
                        <div className="basis-1/2">
                            <img src="/mainpage-features-image2.png" alt="care team benefit" className=""/>
                        </div>
                    </div>
                    <div id="MainPagePreAuthSection5Feature3" className="flex items-center gap-16">
                        <div className="basis-1/2">
                            <img src="/mainpage-features-image3.png" alt="care team benefit" className=""/>
                        </div>
                        <div className="basis-1/2 flex flex-col gap-y-3">
                            <h2 className="text-3xl text-blue-450">
                                Prepare for your future.
                            </h2>
                            <p className="font-bold text-xl">
                                Take the first step toward your future today.
                            </p>
                            <p>
                                Have a plan in place so you can enjoy each day knowing that your voice is heard. Plan today, peace of mind tomorrow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div id="MainPagePreAuthSection6" className="container mx-auto py-20">
                <h2 className="text-3xl text-blue-450">
                    What people have to say
                </h2>
                <Testimonials />
            </div>
            {/*<div id="MainPagePreAuthSection7" className="container mx-auto py-20">*/}
            {/*    <h2 className="text-3xl text-blue-450">*/}
            {/*        Our strategic partners*/}
            {/*    </h2>*/}
            {/*    <div id="MainPagePreAuthSection7Partners" className="flex gap-3">*/}
            {/*        <Partners />*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    )
}

export default MainPagePreAuth
