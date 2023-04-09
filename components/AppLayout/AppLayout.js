import { useUser } from '@auth0/nextjs-auth0/client'
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from "next/image";
import Link from "next/link";
import { Logo } from '../Logo';
import { useContext, useEffect } from 'react';
import PostsContext from '../../utils/context/postsContext';

export const AppLayout = ({ 
    children, 
    availableTokens, 
    posts: postsFromSSR, 
    postId,
    postCreated
}) => {
    const { user } = useUser();

    const { setPostsFromSSR, posts, getPosts, noMorePosts } = useContext(PostsContext);

    useEffect (() => {
        setPostsFromSSR(postsFromSSR);
        if(postId){
            const exists = postsFromSSR.find(post => post._id === postId);
            if(!exists){
                getPosts({getNewerPosts: true, lastPostDate: postCreated});
            }
        }
    }, [postsFromSSR, setPostsFromSSR, postId, postCreated, getPosts]);

    return (
        <div className="grid grid-cols-[377px_1fr] h-screen max-h-screen">
            <div className="flex flex-col text-white overflow-hidden">
                <div className="bg-slate-950 px-5">
                    <Logo />
                    <Link href="/post/new" className="btn py-3">New Blog</Link>
                    <Link href="/token-topup" className='block pb-3 pt-4 text-center'>
                        <FontAwesomeIcon icon={faCoins} className='text-yellow-500' />
                        <span className='px-1 py-3 text-stone-300/80 hover:text-white transition-all'>
                            {availableTokens.toLocaleString()} tokens available
                        </span>
                    </Link>
                </div>
                <div className="px-5 flex-1 overflow-auto bg-gradient-to-b from-slate-950 to-cyan-950">
                    {posts.map((post) => (
                        <Link 
                            key={post._id}
                            href={`/post/${post._id}`}
                            className={`py-3 text-lg border border-white/0 hover:bg-white/20 transition-colors block text-ellipsis overflow-hidden whitespace-nowrap my-2 px-2 bg-white/10 cursor-pointer rounded-md ${postId === post._id? "bg-white/20 border-white/50" : ""}`}>
                                {post.topic}
                        </Link>
                    ))}
                    {!noMorePosts && (
                        <div
                            onClick={() => {
                                getPosts({lastPostDate: posts[posts.length -1].created});
                            }}  
                            className='text-stone-300/50 hover:text-white transition-all text-sm py-5 text-center cursor-pointer'
                        >
                            Load more blogs
                        </div>
                    )}
                </div>
                <div className="bg-cyan-950 flex items-center gap-2 border-t-2 border-t-black/50 h-21 px-5 py-3">
                    {!!user ? (
                        <>
                            <div className='min-w-[54px]'>
                                <Image 
                                    src={user.picture}
                                    alt={user.name}
                                    height={54}
                                    width={54}
                                    className='rounded-full'
                                />
                            </div>
                            <div className='flex-1'>
                                <div className='font-bold text-stone-300'>
                                    {user.email}
                                </div>
                                <Link className='text-sm text-stone-300 hover:text-white transition-all' href="/api/auth/logout">
                                    Logout
                                </Link>
                            </div>
                        </>
                    ) : (
                        <Link href="/api/auth/login">Login</Link>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
};