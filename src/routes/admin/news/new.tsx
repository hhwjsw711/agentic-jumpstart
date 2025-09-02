import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { assertIsAdminFn } from "~/fn/auth";
import { NewsEntryForm } from "../-components/news-entry-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNewsTagsFn } from "~/fn/news";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Page } from "../-components/page";
import { PageHeader } from "../-components/page-header";

export const Route = createFileRoute("/admin/news/new")({
  beforeLoad: () => assertIsAdminFn(),
  component: NewNewsEntry,
});

function NewNewsEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: availableTags, isLoading } = useQuery({
    queryKey: ["news-tags"],
    queryFn: () => getAllNewsTagsFn(),
  });

  if (isLoading) {
    return (
      <Page>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/news">News</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Entry</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader
          title="Add News Entry"
          highlightedWord="News"
          description="Add a new AI news entry, YouTube video, or blog post"
        />

        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          <div className="h-20 bg-muted rounded mb-4"></div>
          <div className="h-10 bg-muted rounded mb-4"></div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/news">News</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add Entry</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Add News Entry"
        highlightedWord="News"
        description="Add a new AI news entry, YouTube video, or blog post"
      />

      <div className="max-w-2xl">
        <NewsEntryForm
          availableTags={availableTags || []}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["admin", "news-entries"],
            });
            navigate({ to: "/admin/news" });
          }}
        />
      </div>
    </Page>
  );
}
