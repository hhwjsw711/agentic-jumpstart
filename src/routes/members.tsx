import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Page } from "~/routes/admin/-components/page";
import { PageHeader } from "~/routes/admin/-components/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Users } from "lucide-react";
import { getPublicMembersFn } from "~/fn/profiles";

export const Route = createFileRoute("/members")({
  component: MembersPage,
  loader: async () => {
    const members = await getPublicMembersFn();
    return { members };
  },
});

function MembersPage() {
  const { members } = Route.useLoaderData();

  return (
    <Page>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Community Members"
          highlightedWord="Members"
          description={
            <span>
              Meet the amazing people enrolled in our course community
            </span>
          }
        />

        {members && members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member) => (
              <Link
                key={member.id}
                to="/profile/$userId"
                params={{ userId: member.id.toString() }}
              >
                <Card className="hover:shadow-elevation-2 transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Avatar */}
                      <Avatar className="w-20 h-20 shadow-elevation-1 group-hover:shadow-elevation-2 transition-shadow">
                        <AvatarImage
                          src={member.image || undefined}
                          alt={member.displayName || "Member"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-theme-500 text-white text-xl font-semibold">
                          {member.displayName
                            ? member.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name */}
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">
                          {member.displayName || "Anonymous"}
                        </h3>
                        {member.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {member.bio}
                          </p>
                        )}
                      </div>

                      {/* Join date */}
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {new Date(member.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-theme-100 to-theme-200 dark:from-theme-900 dark:to-theme-800 shadow-elevation-2 inline-block">
                  <Users className="h-8 w-8 text-theme-600 dark:text-theme-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Public Members Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to make your profile public and join our
                    community showcase!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Page>
  );
}
