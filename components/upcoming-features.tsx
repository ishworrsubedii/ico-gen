import { motion } from 'framer-motion'
import { Zap, Calendar } from 'lucide-react'

export default function UpcomingFeaturesSection() {
  const features = [
    { icon: <Zap className="h-6 w-6" />, title: "Batch Generation", description: "Create multiple icons at once for your entire project." },
    { icon: <Calendar className="h-6 w-6" />, title: "Style Presets", description: "Apply and save your favorite styles for quick access." },
  ]

  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold mb-8 text-center">Upcoming Features</h3>
      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-start space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full">
              {feature.icon}
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}