import React, { useState } from 'react';
import { Heart, Calendar, Users, FileText, Phone, Clock, Shield, Award, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Menu, X, Stethoscope, Activity, Ambulance } from 'lucide-react';

const Home = () => {
  return (
    <div>
      <section id="home" className="pt-20 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Smart Healthcare <span className="text-blue-600">Management System</span>
            </h1>
            <p className="text-lg text-gray-600">
              Experience seamless healthcare management with our cutting-edge platform. Book appointments, access medical records, and connect with top doctors - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
              <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Find a Doctor</span>
              </button>
            </div>
            <div className="flex items-center space-x-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-gray-600">Expert Doctors</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">50k+</p>
                <p className="text-gray-600">Happy Patients</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">24/7</p>
                <p className="text-gray-600">Support</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <Stethoscope className="w-16 h-16 text-blue-600" />
                  <Activity className="w-16 h-16 text-green-600" />
                  <Ambulance className="w-16 h-16 text-red-600" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  


    </div>
  )
}

export default Home
