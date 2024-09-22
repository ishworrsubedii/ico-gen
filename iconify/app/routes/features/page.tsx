import { CheckCircle } from 'lucide-react'

const features = [
  "AI-powered icon generation",
  "Customizable styles and themes",
  "Export in multiple formats",
  "Batch processing",
  "Integration with design tools",
]

const upcomingProjects = [
  {
    title: "Advanced Animation Editor",
    description: "Create animated icons with our new AI-powered animation tool.",
  },
  {
    title: "Icon Collections",
    description: "Organize and manage your generated icons in custom collections.",
  },
  {
    title: "Collaboration Features",
    description: "Work together with your team on icon projects in real-time.",
  },
]

export default function Features() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Current Features</h2>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="text-primary mr-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Projects</h2>
          <div className="space-y-4">
            {upcomingProjects.map((project, index) => (
              <div key={index} className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}