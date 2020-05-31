import {Link} from 'blitz'
import {ArrowRight} from 'heroicons-react'
import {FC} from 'react'

import {Project} from 'db'
import {ProjectCard} from './ProjectCard'

type ProjectListProps = {
  projects: Project[]
}

export const ProjectList: FC<ProjectListProps> = ({projects}) => (
  <main className="relative bg-white shadow">
    <div className="absolute top-0 w-full h-8 -mt-4 bg-white" />
    <div className="max-w-6xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3 lg:col-gap-5 lg:row-gap-12">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} i={i} />
        ))}
      </div>
    </div>
  </main>
)
