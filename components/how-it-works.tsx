import { motion } from 'framer-motion'

export default function HowItWorksSection() {
  const steps = [
    { title: "Describe", description: "Tell us about your icon idea in simple words." },
    { title: "Generate", description: "Our AI creates multiple icon options based on your description." },
    { title: "Customize", description: "Fine-tune your chosen icon with our easy-to-use editor." },
  ]

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold mb-8 text-center">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-[#3C3838] p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{step.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}