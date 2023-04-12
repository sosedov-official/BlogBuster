import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout} from '../../components/AppLayout';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from "mongodb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurst, faCopy } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import PostsContext from "../../utils/context/postsContext";

/* Function for capitalizing the Keywords */
function capitalizeWords(string) {
  const exceptionWords = [    "a", "an", "the", "and", "but", "or", "for", "nor", "at", "by", "from",    "in", "into", "of", "off", "on", "onto", "out", "over", "to", "up", "with"  ];

  return string
    .split(" ")
    .map((word, index) => {
      const hyphenatedWords = word.split("-");

      if (hyphenatedWords.length > 1) {
        word = hyphenatedWords
          .map((hyphenatedWord) =>
            hyphenatedWord.charAt(0).toUpperCase() + hyphenatedWord.slice(1)
          )
          .join("-");
      }

      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      return exceptionWords.includes(word.toLowerCase())
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/* Copy Function */
const CopyButton = ({ text, postId }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [postId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2584);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-blue-600 text-sm hover:text-blue-800 transition-colors duration-200"
    >
      {copied ? <strong className="bg-green flex" >Copied!</strong> : <FontAwesomeIcon icon={faCopy} className="bg-green flex text-lg" />}
    </button>
  );
};


export default function Post(props) {
  console.log("PROPS: ", props);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {deletePost} = useContext(PostsContext);

  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [props.id]);

  const handleDeleteConfirm = async () => {
    try{
      const response = await fetch(`/api/deletePost`, {
        method: 'POST',
        headers: {
          'content-type': "application/json",
        },
        body: JSON.stringify({ postId: props.id }),
      });
      const json = await response.json();
      if (json.success) {
        deletePost(props.id);
        router.replace(`/post/new`);
      }
    } catch (e) {}
  };
  

  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="title-strip">
          SEO Title and Meta Description
          <CopyButton text={`${props.title}\n${props.metaDescription}`} postId={props.id} />
        </div>
        <div className="p-4 my-2 border border-stone-200 rounded-md"> 
          <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
          <div className="mt-2">{props.metaDescription}</div>
        </div>
        <div className="title-strip">
          Keywords
          <CopyButton text={props.keywords} postId={props.id} />
        </div>
        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, i) => (
            <div key={i} className="py-1 px-5 rounded-full bg-slate-800 text-white text-lg">
              <FontAwesomeIcon icon={faBurst} size="lg" /> {capitalizeWords(keyword.trim())}
            </div>
          ))}
        </div>
        <div className="title-strip">
          Blog Post
          <CopyButton text={props.postContent} postId={props.id} />
        </div>
      <div dangerouslySetInnerHTML={{__html: props.postContent || ""}} />
      <div className="my-12">
        {!showDeleteConfirm && (
          <button 
            className="btn w-72 mx-auto text-base bg-red-700 hover:bg-red-600"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete blog
          </button>
        )}
        {!!showDeleteConfirm && (
          <div className="bg-red-200 p-1 text-center rounded-md">
            <p>
              Are you sure? This action is 
              <strong> irreversible</strong>
            </p>
            <div className="grid grid-cols-2 gap-8 px-8 py-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn text-base bg-stone-600 hover:bg-stone-500">
                  cancel
                </button>
              <button 
                onClick={handleDeleteConfirm}
                className="btn text-base bg-red-700 hover:bg-red-600">
                  confirm delete
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx){
    const props = await getAppProps(ctx);
    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("BBData");
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub
    });
    const post = await db.collection("blogs").findOne({
      _id: new ObjectId(ctx.params.postId),
      userId: user._id
    });

    if(!post){
      return{
        redirect: {
          destination: "/post/new",
          permanent: false
        }
      }
    }

    return {
      props: {
        id: ctx.params.postId,
        postContent: post.postContent,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        postCreated: post.created.toString(),
        ...props,
      },
    };
  },
});