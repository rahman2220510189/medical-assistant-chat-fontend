import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-300 text-base-content mt-auto">
      {/* Main Footer Content */}
      <div className="footer gap-4 sm:gap-6 md:gap-8 p-6 sm:p-8 md:p-10 lg:px-20 max-w-7xl mx-auto">
        {/* Services Section */}
        <nav className="flex flex-col gap-2">
          <h6 className="footer-title text-sm sm:text-base md:text-lg font-bold">Services</h6>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Branding</a>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Design</a>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Marketing</a>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Advertisement</a>
        </nav>

        {/* Company Section */}
        <nav className="flex flex-col gap-2">
          <h6 className="footer-title text-sm sm:text-base md:text-lg font-bold">Company</h6>
          <a className="link link-hover text-xs sm:text-sm md:text-base">About us</a>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Contact</a>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Jobs</a>
          <a className="link link-hover text-xs sm:text-sm md:text-base">Press kit</a>
        </nav>

        {/* Social Section */}
        <nav className="flex flex-col gap-2">
          <h6 className="footer-title text-sm sm:text-base md:text-lg font-bold">Social</h6>
          <div className="grid grid-flow-col gap-3 sm:gap-4">
            {/* Twitter */}
            <a href="#" className="hover:opacity-80 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="fill-current sm:w-6 sm:h-6">
                <path
                  d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="hover:opacity-80 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="fill-current sm:w-6 sm:h-6">
                <path
                  d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" className="hover:opacity-80 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="fill-current sm:w-6 sm:h-6">
                <path
                  d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </nav>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-base-300 bg-base-200 px-6 sm:px-8 md:px-10 lg:px-20 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm md:text-base text-center sm:text-left">
            © {currentYear} Medical Assistant Chat. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm md:text-base">
            <a href="#" className="link link-hover">Privacy Policy</a>
            <a href="#" className="link link-hover">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
