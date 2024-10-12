import { X } from 'lucide-react';
import { Icons } from './icons';

export const Header = () => {
  return (
    <div className='w-full h-fit p-5 z-10'>
      <div className='border bg-white h-fit w-full rounded-[2.3rem] pl-8 pr-10 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-5'>
            <a href='/' className='cursor-default'>
              <Icons.shampsLogo className='w-[62px] h-[27px]' />
            </a>
            <X strokeWidth={1} />
            <a href='/' className='cursor-default'>
              <Icons.rzdLogo className='w-[62px] h-[27px]' />
            </a>
          </div>
          <div className='flex gap-24'>
            <div className='text-lg font-consolas flex gap-10'>
              <a href='/dashboard' target='_blank' rel='noopener noreferrer'>
                <p className='cursor-pointer'>[ Dashboard ]</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
