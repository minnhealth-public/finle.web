import React from 'react';
import TextCircle from './TextCircle';
import HeartIcon from '../Icon/HeartIcon';


interface UserCircleProps extends React.ComponentProps<"div"> {
  firstName: string
  lastName: string
  email: string
  isCaree?: boolean
}

const UserCircle: React.FC<UserCircleProps> = ({ firstName, lastName, email, isCaree, ...props }) => {
  // Currenlty we have no image for the user
  const colors = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#facc15",
    "#a3e635",
    "#4ade80",
    "#34d399",
    "#2dd4bf",
    "#22d3ee",
    "#38bdf8",
    "#60a5fa",
    "#818cf8",
    "#a78bfa",
    "#c084fc",
    "#e879f9",
    "#f472b6",
    "#fb7185",
  ]

  const hashString = `${firstName}${lastName}`

  const hashCode = (stringToHash: string) => {
    var hash = 0,
      i, chr;
    if (stringToHash.length === 0) return hash;
    for (i = 0; i < stringToHash.length; i++) {
      chr = stringToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  if (firstName === undefined && lastName === undefined && email === undefined)
    return <></>

  const colorIndex = Math.abs(hashCode(hashString === "" ? email : hashString)) % colors.length
  const circleText = hashString !== "" ? firstName.charAt(0) + lastName.charAt(0) : email.charAt(0);

  const getCareeStyle = () => {
    return { color: colors[colorIndex], borderColor: colors[colorIndex], borderWidth: "1px", background: 'white' };
  }



  return (
    <div className={`relative ${props.className || ""}`} style={props.style}>
      <TextCircle className="absolute shadow-lg" color={colors[colorIndex]} text={circleText} />
      {isCaree &&
        <div className="relative w-full h-full">

          <div className={"absolute !w-2/5 !h-2/5  -right-[10%]"}>
            <div
              className={`w-full h-full rounded-full flex flex-row`}
              style={getCareeStyle()}
            >
              <div className="w-4 m-auto"><HeartIcon /></div>
            </div>

          </div>
        </div>
      }
    </div>
  )
}

export default UserCircle;
