import { AnimatedTooltip } from "@/components/ui/motion-tooltip";

interface TeacherCardTooltipProps {
  email: string;
}

export default function TeacherCardTooltip(props: TeacherCardTooltipProps) {
  const avatars = [
    {
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAV1BMVEUAAAD////IyMi5ubnDw8PLy8sfHx+9vb0aGhoEBAS0tLQtLS3Z2dnT09MnJyfAwMAODg4UFBTr6+tDQ0Opqalzc3M2NjY7Ozvh4eFRUVH5+fmdnZ2AgICe8qnMAAACnUlEQVRoge2Y23aDIBBFCVFjvKCh1iRN/v87W5dzkFgUQXjzPGWJ7oxzgXHYKaLYAT/gB/yAR4PLOuUBldZygsuvKwuq65ecLO/CshnrdJ8XYdnFZ0CD0gsE9JGOP863UOjbeSSmD/ZdVkQPBSd2VX6zkoEeyDMF2H/olrG+Jtvb/eiW7K57xkackMFsJ7ulmC5lFNXLzqjeLhTLTL+qPLMPrvlElwgRVcRSzBfK3fmu8rv8vyb25vt5ye5BiGrjZfutMcVyUo+c8YEjT/qlG0TtTSd2bfQJ0TnRczd0Tmy+wp5sb9zgjd3uQRlsd4gq6pIvxHJSyZ39DrYhv+fKK0fPkE+qTXHK6e7E+paDsoRs2ZgDqCa+5Wa+Xjsr1lhPj9bpLUcJilFiobdkxcWSg7OnKN+T9duIXTuej1ty16cm6MnEGlXu7m8oJ3qy0KRese64D43KzmtP47/PHnbrthk9w9ffazPcUCGoM2843GKynaslP7fAqSY615Z8AopUpE5PP2NwXknfVFSN2Z1IjzuW7g/6v7tnE4jy51Pfeuqefdv2zw7ObpV73MofGxcf/KkC+1M1TfWjBzLHBuCwcanSH2OFfVUX7ca58xaAJE7Vldec/VJLuHcjHcdcqr3rW+po+Z5WBJrAbUdopWKp6y2JL3X0IPLMlgO6XNw0nq+uKLrXc35dbUHW1gIHgEvdoZZtTZGojT6xCfm+3ip62D1I2b7W5Pq1oYOsrSiaf8uRbxbZvtT8Z04ZO1e++tkiXBvQudCQGjxT7v6IVrv0v3yH3V4fW9DFbHvv/6lloH9+nsccLGAkEmBYRAcLjUSiDnOijqGiDtCijv5OQX0ySg0tiR10Unz9GLfGHBTHHXHHHM7H0gE/4Af8gMfQL1aOIp8fkoQiAAAAAElFTkSuQmCC",
      fallback: "Email",
      name: "Email Address",
      designation: props.email,
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-center justify-center">
        <AnimatedTooltip items={avatars} />
      </div>
    </div>
  );
}
