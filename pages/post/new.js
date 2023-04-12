import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurst } from "@fortawesome/free-solid-svg-icons";

export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try{
      const response = await fetch(`/api/generatePost`, {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ topic, keywords }),
      });
      const json = await response.json();
      console.log('RESULT: ', json);
      if(json?.postId){
        router.push(`/post/${json.postId}`);
      }
    } catch(e) {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-hidden">
      {!!generating && (
        <div className="text-green-500 flex h-full animate-pulse w-full flex-col justify-center items-center">
          <FontAwesomeIcon icon={faBurst} className="text-9xl"/>
          <h5 class="tracking-wider" >Generating...</h5>
        </div>
      )}
      {!generating && (
        <div className="w-full h-full flex flex-col overflow-auto">
          <form onSubmit={handleSubmit} className='mx-auto my-36 w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'>
            <div>
              <label className="text-xl">
                <strong>Blog topic:</strong>
              </label>
              <textarea
                placeholder="The Art of Blogging: Boost Your Creativity and Propel Your Business"
                className="resize-none border border-slate-300 w-full block my-2 px-4 py-2 rounded-md"
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                maxLength={89}
              />
            </div>
            <div>
              <label className="text-xl">
                <strong>Keywords:</strong>
              </label>
              <textarea 
                placeholder="SEO for beginners, Blogging Tips" 
                className="resize-none border border-slate-300 w-full block my-2 px-4 py-2 rounded-md" 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)} 
                maxLength={89}
              />
              <small className="block mb-5 ml-2">
                Separate keywords with a comma
              </small>
            </div>
            <button type="submit" className="btn" disabled={!topic.trim() || !keywords.trim()}>
              Generate
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx){
    const props = await getAppProps(ctx)

    if (!props.availableTokens){
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false,
        }
      };
    }

    return {
      props
    };
  },
});