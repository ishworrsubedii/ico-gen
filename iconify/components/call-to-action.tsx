import {Button} from "@/components/ui/button"

export default function CallToActionSection() {
    return (
        <section className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Create?</h3>
            <p className="mb-8">Join thousands of designers and developers using Iconify to streamline their
                workflow.</p>
            <Button size="lg">
                Get Started for Free
            </Button>
        </section>
    )
}