import { motion } from 'framer-motion';
//import Link from 'next/link';
import Image from 'next/image';

import { MessageIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <Image 
            src="/tt-logo.png"
            alt="Stanford Technology Training logo"
            width={1250}
            height={313}
            className="object-contain w-1/2"
          />
        </p>
        <p>
          This is an AI playground provided by Stanford Technology Training.
         
          
        </p>
       
      </div>
    </motion.div>
  );
};
