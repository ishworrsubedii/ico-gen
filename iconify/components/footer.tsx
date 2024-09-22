import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-900 py-2">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">&copy; 2023 Iconify. All rights reserved.</p>
                    <div className="flex space-x-3">
                        <a 
                            href="https://www.linkedin.com/in/your-linkedin" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                            <FaLinkedin size={18} />
                        </a>
                        <a 
                            href="https://github.com/your-github" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                            <FaGithub size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
