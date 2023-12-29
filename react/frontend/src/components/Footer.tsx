import React from "react";
import {ScrollUpButton} from "../shared/Form";
import {NavigationLink} from "../shared/NavigationLink";

export const Footer: React.FC = () => {
    return (
        <div id="FooterWrapper" className="bg-white-50 bg-opacity-50">
            <div className="md:flex gap-8 p-8 items-baseline justify-between">
                <div className="text-2xl">
                    START Planning
                </div>
                <div className="text-xl md:flex-col md:flex-nowrap">
                    <div className="md:flex md:gap-12">
                        <NavigationLink href="/videos" label="Learn" />
                        <NavigationLink href="/resource" label="Resources" />
                        <NavigationLink href="/about" label="About" />
                        <NavigationLink href="/my-portal" label="My Portal" />
                    </div>

                    <div className="md:flex md:gap-12">
                        <NavigationLink href="/to-do" label="To Do" />
                        <NavigationLink href="/partners" label="Partners" />
                        <NavigationLink href="/glossary" label="Glossary" />
                        <NavigationLink href="/partners" label="Partners" />
                    </div>
                    <div className="md:flex md:gap-12">
                        <NavigationLink href="/account" label="Account" />
                        <NavigationLink href="/my-notes" label="My Notes" />
                    </div>
                </div>
                <div className="flex">
                    <div className="flex items-center">
                        <p className="lg:text-xl  md:text-xl sm:text-lg text-font-bold rounded-font mr-4">
                            Plan today. Peace of mind tomorrow.
                        </p>
                        <ScrollUpButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
