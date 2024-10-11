import { Icons } from "./icons";

export const Header = () => {
  return (
    <div className='w-full h-fit fixed p-5 z-10'>
      <div className='border bg-white h-fit w-full rounded-[2.3rem] pl-8 pr-10 py-4'>
        <div className='flex justify-between items-center'>
          <a
            href='/'
            className='cursor-default'
          >
            <Icons.logo className='w-[62px] h-[27px]' />
          </a>
          <div className='hidden md:flex gap-24'>
            <div className='text-lg font-consolas flex gap-10'>
              <a
                href='/dashboard'
                target='_blank'
                rel='noopener noreferrer'
              >
                <p className='cursor-pointer'>[ Dashboard ]</p>
              </a>
              <a
                href='https://lk.hacks-ai.ru/event/1077380/form'
                target='_blank'
                rel='noopener noreferrer'
              >
                <p className='cursor-pointer'>[ РЖД ]</p>
              </a>
            </div>
            <div className='flex gap-5 items-center'>
              <a
                href='https://t.me/shampsdev'
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icons.telegram />
              </a>
              <a
                href='https://www.youtube.com/@shampsdev'
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icons.youtube />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
