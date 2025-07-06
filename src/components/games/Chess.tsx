import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Chess() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Chess</CardTitle>
            </CardHeader>
            <CardContent>
                <p>This game is not yet available. Check back soon!</p>
            </CardContent>
        </Card>
    );
}
