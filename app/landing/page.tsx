"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  TestTube,
  Shield,
  Clock,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Microscope,
  Heart,
  Award,
  ArrowRight,
  Calendar,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <TestTube className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-blue-600">SUGAR</span>
                <span className="text-sm text-gray-600 ml-2">DIAGNOSTIC LAB</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">
                Reviews
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
              <Link href="/admin-login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Your Health, <span className="text-blue-600">Our Priority</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                At Sugar Diagnostic Lab, we offer comprehensive pathology and biochemistry tests with accurate results
                and fast turnaround times. Trusted by thousands of patients and healthcare professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book a Test Today
                </Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10,000+</div>
                  <div className="text-sm text-gray-600">Tests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24hrs</div>
                  <div className="text-sm text-gray-600">Report Delivery</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-mint-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <TestTube className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-medium">Blood Tests</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Microscope className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-medium">Pathology</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Heart className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-medium">Health Checkups</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Shield className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-medium">Certified Lab</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Diagnostic Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive range of pathology and biochemistry tests using advanced equipment and
              following strict quality standards for accurate, reliable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <TestTube className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Complete Blood Count (CBC)</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive blood analysis including hemoglobin, white blood cells, platelets, and differential
                  counts.
                </p>
                <Button variant="outline" className="w-full">
                  Book CBC Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Liver Function Test (LFT)</h3>
                <p className="text-gray-600 mb-4">
                  Assess liver health with bilirubin, enzymes, proteins, and other liver function markers.
                </p>
                <Button variant="outline" className="w-full">
                  Book LFT Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Microscope className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Blood Sugar Tests</h3>
                <p className="text-gray-600 mb-4">
                  Monitor diabetes with fasting glucose, HbA1c, and post-meal blood sugar testing.
                </p>
                <Button variant="outline" className="w-full">
                  Book Sugar Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lipid Profile</h3>
                <p className="text-gray-600 mb-4">
                  Cardiovascular risk assessment with cholesterol, triglycerides, and lipid analysis.
                </p>
                <Button variant="outline" className="w-full">
                  Book Lipid Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Thyroid Function</h3>
                <p className="text-gray-600 mb-4">
                  Complete thyroid assessment with TSH, T3, T4, and other thyroid hormone tests.
                </p>
                <Button variant="outline" className="w-full">
                  Book Thyroid Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Health Packages</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive health checkup packages for preventive care and early detection.
                </p>
                <Button variant="outline" className="w-full">
                  View Packages
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
              <Phone className="mr-2 h-5 w-5" />
              Call to Book Your Test
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Sugar Diagnostic Lab?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted results, delivered fast. Our commitment to excellence and patient care sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">99.9% Accuracy</h3>
              <p className="text-gray-600">
                State-of-the-art equipment and rigorous quality control ensure the most accurate results.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Turnaround</h3>
              <p className="text-gray-600">
                Most test results delivered within 24 hours, with urgent tests available same day.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Certified Lab</h3>
              <p className="text-gray-600">
                Fully accredited laboratory with experienced pathologists and lab technicians.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Patient-Centered</h3>
              <p className="text-gray-600">
                Friendly staff, comfortable environment, and personalized care for every patient.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Trusted by Healthcare Professionals</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Over 500+ doctors and clinics trust Sugar Diagnostic Lab for accurate, reliable test results that help
              them provide the best care for their patients.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from real patients and healthcare providers who trust our lab for accurate, timely results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Excellent service! Got my CBC results within 24 hours and the staff was very professional. The online
                  report system is very convenient."
                </p>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Priya Sharma</div>
                    <div className="text-sm text-gray-600">Patient</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "As a doctor, I rely on Sugar Diagnostic Lab for accurate results. Their quality control and quick
                  turnaround time helps me provide better patient care."
                </p>
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Dr. Rajesh Kumar</div>
                    <div className="text-sm text-gray-600">General Physician</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Very clean facility and friendly staff. The digital reports are easy to understand and I can access
                  them anytime online. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Amit Patel</div>
                    <div className="text-sm text-gray-600">Patient</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or need to book a test? Reach out today – we're here to help with all your diagnostic
              needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-gray-600">+91 98765 43210</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-600">info@sugardiagnosticlab.com</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-gray-600">
                      123 Health Street, Medical District
                      <br />
                      Mumbai, Maharashtra 400001
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Working Hours</div>
                    <div className="text-gray-600">
                      Monday to Sunday
                      <br />
                      8:00 AM - 8:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>

              <div className="space-y-4">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                  <Calendar className="mr-3 h-5 w-5" />
                  Book a Test by Phone
                </Button>

                <Button size="lg" variant="outline" className="w-full justify-start">
                  <Phone className="mr-3 h-5 w-5" />
                  Call for Home Collection
                </Button>

                <Button size="lg" variant="outline" className="w-full justify-start">
                  <Mail className="mr-3 h-5 w-5" />
                  Email Us Your Query
                </Button>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">Home Collection Available</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Book by phone and our trained phlebotomist will visit your home for sample collection at no extra
                  cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-full">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">SUGAR</span>
                  <span className="text-sm text-gray-400 ml-2">DIAGNOSTIC LAB</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Trusted pathology and biochemistry testing with accurate results and fast turnaround times.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div className="bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <div className="bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blood Tests
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pathology
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Biochemistry
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Health Packages
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Home Collection
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Book Test
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@sugardiagnosticlab.com</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <span>
                    123 Health Street, Medical District
                    <br />
                    Mumbai, Maharashtra 400001
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sugar Diagnostic Lab. All rights reserved. | Designed for accurate, reliable healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
