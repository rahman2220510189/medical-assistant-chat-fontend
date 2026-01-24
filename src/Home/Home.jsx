import React, { useState } from 'react';
import { Heart, Calendar, Users, FileText, Phone, Clock, Shield, Award, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Menu, X, Stethoscope, Activity, Ambulance } from 'lucide-react';

const Home = () => {
  const receptionist = [
    {
      name: ' Sarah Johnson',
      specialization: 'Receptionist',
      experience: '15 years',
      image: 'https://i.postimg.cc/QN5zdtrN/360-F-379625084-o677x-EDLJFg-UGx-ZOfp-RZm-Go-W4QT2r4QW.jpg'
    },
    {
      name: ' Michael Chen',
      specialization: 'Receptionist',
      experience: '12 years',
      image: 'https://i.postimg.cc/L80DTKMx/images-(3).jpg'
    },
    {
      name: 'Emily Rodriguez',
      specialization: 'Receptionist',
      experience: '10 years',
      image: 'https://i.postimg.cc/LXPx5yGd/istockphoto-910148934-612x612.jpg'
    },
    {
      name: 'Julena Wilson',
      specialization: 'Receptionist',
      experience: '18 years',
      image: 'https://i.postimg.cc/ZYrfhMrZ/medical-receptionist.webp'
    }
  ];

  const features = [
    {
      icon: Award,
      title: 'Trusted Doctors',
      description: 'All our doctors are certified and highly experienced professionals'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock medical assistance and emergency services'
    },
    {
      icon: Shield,
      title: 'Secure Medical Records',
      description: 'Your medical data is protected with enterprise-grade security'
    }
  ];

  const services = [
    {
      icon: Calendar,
      title: 'Online Appointment',
      description: 'Book appointments with doctors instantly through our easy-to-use platform.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Doctor Management',
      description: 'Access a network of qualified healthcare professionals across specialties.',
      color: 'green'
    },
    {
      icon: FileText,
      title: 'Patient Records',
      description: 'Secure digital storage and easy access to all your medical records.',
      color: 'purple'
    },
    {
      icon: Phone,
      title: 'Emergency Support',
      description: '24/7 emergency assistance and quick response medical care services.',
      color: 'red'
    }
  ];
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
    <section id="about" className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="max-w-2xl mx-auto opacity-90">
            We are committed to providing the best healthcare experience with modern technology and compassionate care
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="opacity-90">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare solutions designed to make your medical journey smooth and efficient
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-blue-200">
              <div className={`bg-${service.color}-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                <service.icon className={`w-8 h-8 text-${service.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
   
    <section id="doctors" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Contract Our Receptionists</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team of experienced healthcare professionals dedicated to your wellbeing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {receptionist.map((receptionist, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <img src={receptionist.image} alt={receptionist.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{receptionist.name}</h3>
                <p className="text-blue-600 font-medium mb-1">{receptionist.specialization}</p>
                <p className="text-gray-600 text-sm mb-4">{receptionist.experience} experience</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Contact Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>


    </div>
  )
}

export default Home
