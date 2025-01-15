import useMediaQuery from "./useMediaQuery";

export default function useMediaQueries() {

  const sm = useMediaQuery("(max-width: 640px)");
  const md = useMediaQuery("(max-width: 768px)");
  const lg = useMediaQuery("(max-width: 1024px)");
  const xl = useMediaQuery("(max-width: 1280)");
  const xxl = useMediaQuery("(max-width: 1536)");

  return { sm, md, lg, xl, xxl };
}
